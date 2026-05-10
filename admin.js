/* ============================================================
   admin.js · 后台逻辑
   依赖: db.js
   ============================================================ */

const $  = (s, r=document) => r.querySelector(s);
const $$ = (s, r=document) => [...r.querySelectorAll(s)];

const SESSION_KEY = 'luxe.admin.session';

/* ---------- Toast ---------- */
function toast(msg, isErr=false) {
  const el = $('#toast');
  el.textContent = msg;
  el.classList.toggle('err', isErr);
  el.classList.add('show');
  clearTimeout(toast._t);
  toast._t = setTimeout(() => el.classList.remove('show'), 2200);
}

/* ---------- 登录 ---------- */
function isAuth() {
  const s = sessionStorage.getItem(SESSION_KEY);
  return s === '1';
}
function setAuth(on) {
  if (on) sessionStorage.setItem(SESSION_KEY, '1');
  else sessionStorage.removeItem(SESSION_KEY);
}

function showLogin() {
  $('#loginScreen').style.display = 'flex';
  $('#adminShell').style.display = 'none';
  $('#passInput').focus();
}
function showAdmin() {
  $('#loginScreen').style.display = 'none';
  $('#adminShell').style.display = 'flex';
  refreshAll();
}

$('#loginForm').addEventListener('submit', e => {
  e.preventDefault();
  const pass = $('#passInput').value;
  const settings = DB.getSettings();
  if (pass === settings.adminPass) {
    setAuth(true);
    $('#loginErr').textContent = '';
    showAdmin();
  } else {
    $('#loginErr').textContent = '密码错误';
    $('#passInput').value = '';
  }
});

$('#logoutBtn').addEventListener('click', () => {
  setAuth(false);
  showLogin();
  toast('已退出登录');
});

/* ---------- Tab 切换 ---------- */
$$('.side-nav button').forEach(b => {
  b.addEventListener('click', () => {
    $$('.side-nav button').forEach(x => x.classList.remove('active'));
    b.classList.add('active');
    const tab = b.dataset.tab;
    $$('.tab-pane').forEach(p => p.classList.remove('active'));
    $(`.tab-pane[data-pane="${tab}"]`).classList.add('active');
    $('#pageTitle').textContent = b.querySelector('span').textContent;
    if (tab === 'dashboard') renderDashboard();
    if (tab === 'products') renderProductTable();
    if (tab === 'orders') renderOrderTable();
    if (tab === 'content') loadContentForms();
    if (tab === 'texts') renderTextEditor();
    if (tab === 'settings') loadSettingsForm();
  });
});

/* ---------- Dashboard ---------- */
function renderDashboard() {
  const products = DB.getProducts();
  const orders = DB.getOrders();
  const pending = orders.filter(o => o.status === 'pending').length;
  const revenue = orders
    .filter(o => o.status !== 'cancelled')
    .reduce((s, o) => s + (o.total || 0), 0);

  $('#kpiProducts').textContent = products.length;
  $('#kpiOrders').textContent = orders.length;
  $('#kpiPending').textContent = pending;
  $('#kpiRevenue').textContent = '¥' + revenue.toLocaleString();

  const recent = orders.slice(0, 6);
  $('#recentOrders').innerHTML = recent.length === 0
    ? '<p class="muted small">暂无订单</p>'
    : recent.map(o => `
      <div class="recent-item">
        <div>
          <strong>${o.id}</strong>
          <p class="muted">${o.customer?.name || '—'} · ¥${(o.total||0).toLocaleString()}</p>
        </div>
        <span class="status ${o.status}">${statusLabel(o.status)}</span>
      </div>
    `).join('');

  // 热销 = 按订单中商品数量统计
  const counts = {};
  orders.forEach(o => (o.items || []).forEach(it => {
    counts[it.id] = (counts[it.id] || 0) + it.qty;
  }));
  const top = Object.entries(counts)
    .sort((a,b) => b[1]-a[1])
    .slice(0, 5)
    .map(([id, qty]) => {
      const p = products.find(p => p.id === +id);
      return p ? { name: p.name, qty } : null;
    }).filter(Boolean);

  $('#topProducts').innerHTML = top.length === 0
    ? '<p class="muted small">暂无销售数据</p>'
    : top.map((p,i) => `
      <div class="recent-item">
        <div><strong style="color:var(--gold)">#${i+1}</strong>　${p.name}</div>
        <span>售出 ${p.qty} 件</span>
      </div>
    `).join('');

  // sidebar badge
  $('#orderCount').textContent = pending;
  $('#orderCount').style.display = pending > 0 ? 'inline-block' : 'none';
}

function statusLabel(s) {
  return ({pending:'待支付', paid:'已支付', shipped:'已发货', completed:'已完成', cancelled:'已取消'})[s] || s;
}

/* ---------- 产品 ---------- */
let prodSearchKey = '';
$('#prodSearch').addEventListener('input', e => {
  prodSearchKey = e.target.value.trim().toLowerCase();
  renderProductTable();
});
$('#addProdBtn').addEventListener('click', () => openProdModal(null));

function renderProductTable() {
  const list = DB.getProducts().filter(p => {
    if (!prodSearchKey) return true;
    return (p.name + ' ' + (p.en||'') + ' ' + p.cat).toLowerCase().includes(prodSearchKey);
  });
  $('#productTbody').innerHTML = list.length === 0
    ? '<tr><td colspan="7" style="text-align:center;color:var(--muted);padding:40px">暂无产品</td></tr>'
    : list.map(p => `
      <tr>
        <td><div class="thumb" style="background-image:url('${p.image}')"></div></td>
        <td>
          <strong style="color:var(--cream)">${p.name}</strong>
          <p class="muted" style="font-size:11px">${p.en || ''}</p>
        </td>
        <td>${catLabel(p.cat)}</td>
        <td class="price-cell">¥${p.price.toLocaleString()}</td>
        <td><span class="muted" style="text-decoration:line-through">¥${p.original.toLocaleString()}</span></td>
        <td>${p.stock ?? '-'}</td>
        <td class="actions">
          <button class="tbtn" onclick="openProdModal(${p.id})">编辑</button>
          <button class="tbtn danger" onclick="delProduct(${p.id})">删除</button>
        </td>
      </tr>
    `).join('');
}
function catLabel(c) {
  return ({skincare:'奢护精华', makeup:'高定彩妆', device:'美容仪器', set:'尊享礼盒'})[c] || c;
}

function openProdModal(id) {
  const form = $('#prodForm');
  form.reset();
  if (id) {
    const p = DB.getProducts().find(x => x.id === id);
    if (!p) return;
    $('#prodModalTitle').textContent = '编辑产品';
    form.id.value = p.id;
    form.name.value = p.name;
    form.en.value = p.en || '';
    form.cat.value = p.cat;
    form.tag.value = p.tag || '';
    form.price.value = p.price;
    form.original.value = p.original;
    form.stock.value = p.stock ?? 100;
    form.image.value = p.image;
    form.desc.value = p.desc || '';
    form.feats.value = (p.feats || []).join('\n');
  } else {
    $('#prodModalTitle').textContent = '添加产品';
    form.id.value = '';
    form.stock.value = 100;
  }
  $('#prodModal').classList.add('open');
  document.body.style.overflow = 'hidden';
}
function closeProdModal() {
  $('#prodModal').classList.remove('open');
  document.body.style.overflow = '';
}
window.openProdModal = openProdModal;
window.closeProdModal = closeProdModal;

$('#prodForm').addEventListener('submit', e => {
  e.preventDefault();
  const fd = new FormData(e.target);
  const id = fd.get('id');
  const product = {
    id: id ? +id : Date.now(),
    name: fd.get('name'),
    en: fd.get('en'),
    cat: fd.get('cat'),
    catLabel: catLabel(fd.get('cat')),
    tag: fd.get('tag'),
    price: +fd.get('price'),
    original: +fd.get('original'),
    stock: +fd.get('stock') || 0,
    image: fd.get('image'),
    desc: fd.get('desc'),
    feats: (fd.get('feats') || '').split('\n').map(s => s.trim()).filter(Boolean),
  };
  DB.upsertProduct(product);
  closeProdModal();
  renderProductTable();
  toast(id ? '产品已更新' : '产品已添加');
});

function delProduct(id) {
  if (!confirm('确定删除该产品吗？此操作不可恢复。')) return;
  DB.deleteProduct(id);
  renderProductTable();
  toast('产品已删除');
}
window.delProduct = delProduct;

/* ---------- 订单 ---------- */
let orderSearchKey = '', orderFilter = 'all';
$('#orderSearch').addEventListener('input', e => {
  orderSearchKey = e.target.value.trim().toLowerCase();
  renderOrderTable();
});
$('#orderFilter').addEventListener('change', e => {
  orderFilter = e.target.value;
  renderOrderTable();
});

function renderOrderTable() {
  let list = DB.getOrders();
  if (orderFilter !== 'all') list = list.filter(o => o.status === orderFilter);
  if (orderSearchKey) {
    list = list.filter(o => {
      const blob = (o.id + ' ' + (o.customer?.name||'') + ' ' + (o.customer?.phone||'') + ' ' + (o.customer?.email||'')).toLowerCase();
      return blob.includes(orderSearchKey);
    });
  }
  $('#orderTbody').innerHTML = list.length === 0
    ? '<tr><td colspan="7" style="text-align:center;color:var(--muted);padding:40px">暂无订单</td></tr>'
    : list.map(o => `
      <tr>
        <td><strong style="color:var(--gold);font-family:var(--serif)">${o.id}</strong></td>
        <td>
          <strong style="color:var(--cream)">${o.customer?.name || '—'}</strong>
          <p class="muted" style="font-size:11px">${o.customer?.phone || ''}</p>
        </td>
        <td class="price-cell">¥${(o.total||0).toLocaleString()}</td>
        <td>${payLabel(o.payment)}</td>
        <td><span class="status ${o.status}">${statusLabel(o.status)}</span></td>
        <td><span class="muted" style="font-size:12px">${fmtDate(o.createdAt)}</span></td>
        <td class="actions">
          <button class="tbtn" onclick="openOrderDetail('${o.id}')">详情</button>
        </td>
      </tr>
    `).join('');
}
function payLabel(p) {
  return ({wechat:'微信支付', alipay:'支付宝', whatsapp:'WhatsApp', line:'LINE Pay', bank:'银行电汇'})[p] || p;
}
function fmtDate(ts) {
  if (!ts) return '—';
  const d = new Date(ts);
  return d.toLocaleString('zh-CN', { hour12:false });
}

function openOrderDetail(id) {
  const o = DB.getOrders().find(x => x.id === id);
  if (!o) return;
  const c = o.customer || {};
  $('#orderDetail').innerHTML = `
    <h3>订单 ${o.id}</h3>
    <p class="muted small">下单时间: ${fmtDate(o.createdAt)} · 状态: <span class="status ${o.status}">${statusLabel(o.status)}</span></p>

    <div class="od-grid">
      <div class="od-block">
        <h5>客户信息</h5>
        <p><strong style="color:var(--cream)">${c.name || '—'}</strong></p>
        <p>📞 ${c.phone || '—'}</p>
        <p>✉ ${c.email || '—'}</p>
      </div>
      <div class="od-block">
        <h5>配送信息</h5>
        <p>${c.country || ''} ${c.city || ''} ${c.zip || ''}</p>
        <p>${c.address || '—'}</p>
        ${c.note ? `<p class="muted" style="margin-top:8px;font-style:italic">备注: ${c.note}</p>` : ''}
      </div>
    </div>

    <div class="od-block" style="margin-top:14px">
      <h5>支付方式</h5>
      <p>${payLabel(o.payment)}</p>
    </div>

    <div class="od-items">
      ${(o.items||[]).map(it => `
        <div class="od-items-row">
          <div class="thumb" style="background-image:url('${it.image}')"></div>
          <div>
            <strong style="color:var(--cream)">${it.name}</strong>
            <p class="muted" style="font-size:11px">${it.en || ''}</p>
          </div>
          <div class="muted">x ${it.qty}</div>
          <div class="price-cell">¥${(it.price * it.qty).toLocaleString()}</div>
        </div>
      `).join('')}
    </div>

    <div class="cart-row total" style="margin-top:14px;padding:14px 16px;border:1px solid var(--gold)">
      <span>合计</span>
      <span class="gold-text">¥${(o.total||0).toLocaleString()}</span>
    </div>

    <div class="od-status-actions">
      <button class="tbtn" onclick="updateOrderStatus('${o.id}','paid')">标记已支付</button>
      <button class="tbtn" onclick="updateOrderStatus('${o.id}','shipped')">标记已发货</button>
      <button class="tbtn" onclick="updateOrderStatus('${o.id}','completed')">标记已完成</button>
      <button class="tbtn danger" onclick="updateOrderStatus('${o.id}','cancelled')">取消订单</button>
      <button class="tbtn danger" onclick="deleteOrder('${o.id}')">删除订单</button>
    </div>
  `;
  $('#orderModal').classList.add('open');
  document.body.style.overflow = 'hidden';
}
function closeOrderModal() {
  $('#orderModal').classList.remove('open');
  document.body.style.overflow = '';
}
window.openOrderDetail = openOrderDetail;
window.closeOrderModal = closeOrderModal;

function updateOrderStatus(id, status) {
  DB.updateOrder(id, { status });
  renderOrderTable();
  closeOrderModal();
  toast('订单状态已更新为 ' + statusLabel(status));
}
window.updateOrderStatus = updateOrderStatus;

function deleteOrder(id) {
  if (!confirm('确认删除该订单？此操作不可恢复。')) return;
  DB.deleteOrder(id);
  renderOrderTable();
  closeOrderModal();
  toast('订单已删除');
}
window.deleteOrder = deleteOrder;

/* ---------- Settings ---------- */
function loadSettingsForm() {
  const s = DB.getSettings();
  ['wechatId','whatsappNumber','whatsappLink','lineId','lineLink'].forEach(k => {
    const el = $(`#contactForm [name="${k}"]`);
    if (el) el.value = s[k] || '';
  });
}

$('#contactForm').addEventListener('submit', e => {
  e.preventDefault();
  const fd = new FormData(e.target);
  const s = DB.getSettings();
  ['wechatId','whatsappNumber','whatsappLink','lineId','lineLink'].forEach(k => {
    s[k] = fd.get(k);
  });
  DB.saveSettings(s);
  toast('联系方式已保存，前台已同步');
});

$('#passForm').addEventListener('submit', e => {
  e.preventDefault();
  const fd = new FormData(e.target);
  const s = DB.getSettings();
  if (fd.get('old') !== s.adminPass) {
    toast('当前密码错误', true); return;
  }
  if (fd.get('new') !== fd.get('confirm')) {
    toast('两次新密码不一致', true); return;
  }
  s.adminPass = fd.get('new');
  DB.saveSettings(s);
  e.target.reset();
  toast('密码已更新');
});

/* ---------- 数据维护 ---------- */
$('#exportBtn').addEventListener('click', () => {
  const data = {
    products: DB.getProducts(),
    orders: DB.getOrders(),
    settings: DB.getSettings(),
    exportedAt: new Date().toISOString(),
  };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type:'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = `luxe-backup-${Date.now()}.json`; a.click();
  URL.revokeObjectURL(url);
  toast('已导出全部数据');
});

$('#importBtn').addEventListener('click', () => $('#importFile').click());
$('#importFile').addEventListener('change', async e => {
  const file = e.target.files[0]; if (!file) return;
  try {
    const text = await file.text();
    const data = JSON.parse(text);
    if (data.products) DB.saveProducts(data.products);
    if (data.orders) DB.saveOrders(data.orders);
    if (data.settings) DB.saveSettings(data.settings);
    refreshAll();
    toast('数据已导入');
  } catch (err) {
    toast('导入失败：文件格式错误', true);
  }
});

$('#resetProdBtn').addEventListener('click', () => {
  if (!confirm('确认重置所有产品为系统默认？现有产品将被覆盖！')) return;
  DB.resetProducts();
  renderProductTable();
  toast('已重置为默认产品');
});

$('#clearOrdersBtn').addEventListener('click', () => {
  if (!confirm('确认清空所有订单？此操作不可恢复！')) return;
  DB.saveOrders([]);
  renderOrderTable();
  renderDashboard();
  toast('订单已清空');
});

/* ---------- 全局刷新 ---------- */
function refreshAll() {
  renderDashboard();
  renderProductTable();
  renderOrderTable();
  loadSettingsForm();
}

/* ===========================================================
   内容管理（视频 + 品牌信息）
   =========================================================== */
function loadContentForms() {
  const s = DB.getSettings();
  ['videoUrl','videoPoster'].forEach(k => {
    const el = $(`#contentForm [name="${k}"]`); if (el) el.value = s[k] || '';
  });
  ['brandCN','brandEN','brandMark','siteTitle'].forEach(k => {
    const el = $(`#brandForm [name="${k}"]`); if (el) el.value = s[k] || '';
  });
  // 自动加载预览
  const v = $('#videoPreview');
  if (v && s.videoUrl) {
    v.poster = s.videoPoster || '';
    v.innerHTML = `<source src="${s.videoUrl}" type="video/mp4">`;
    v.load();
  }
}

$('#contentForm')?.addEventListener('submit', e => {
  e.preventDefault();
  const fd = new FormData(e.target);
  const s = DB.getSettings();
  s.videoUrl = fd.get('videoUrl').trim();
  s.videoPoster = fd.get('videoPoster').trim();
  DB.saveSettings(s);
  toast('视频设置已保存，前台刷新即生效');
});

$('#videoPreviewBtn')?.addEventListener('click', () => {
  const url = $('#contentForm [name="videoUrl"]').value.trim();
  const poster = $('#contentForm [name="videoPoster"]').value.trim();
  const v = $('#videoPreview');
  if (!url) { toast('请先填写视频 URL', true); return; }
  v.poster = poster;
  v.innerHTML = `<source src="${url}" type="video/mp4">`;
  v.load(); v.play().catch(()=>{});
});

$('#brandForm')?.addEventListener('submit', e => {
  e.preventDefault();
  const fd = new FormData(e.target);
  const s = DB.getSettings();
  ['brandCN','brandEN','brandMark','siteTitle'].forEach(k => s[k] = fd.get(k).trim());
  DB.saveSettings(s);
  toast('品牌信息已保存');
});

/* ===========================================================
   文案管理
   =========================================================== */
let textLang = 'zh';
let textSearch = '';
let pendingTexts = {}; // { lang: { key: value } }

$$('#textTabs button').forEach(b => {
  b.addEventListener('click', () => {
    $$('#textTabs button').forEach(x => x.classList.remove('active'));
    b.classList.add('active');
    textLang = b.dataset.lang;
    renderTextEditor();
  });
});

$('#textSearch')?.addEventListener('input', e => {
  textSearch = e.target.value.trim().toLowerCase();
  renderTextEditor();
});

function renderTextEditor() {
  if (!window.TEXT_GROUPS) return;  // i18n.js 未加载
  const wrap = $('#textEditor'); if (!wrap) return;
  const s = DB.getSettings();
  const overrides = (s.texts && s.texts[textLang]) || {};
  pendingTexts[textLang] = pendingTexts[textLang] || { ...overrides };

  wrap.innerHTML = '';
  let hits = 0;

  for (const [groupName, keys] of Object.entries(TEXT_GROUPS)) {
    const filtered = keys.filter(k => {
      if (!textSearch) return true;
      const def = (I18N[textLang] && I18N[textLang][k]) || '';
      const cur = pendingTexts[textLang][k] !== undefined ? pendingTexts[textLang][k] : def;
      return (k + ' ' + def + ' ' + cur).toLowerCase().includes(textSearch);
    });
    if (filtered.length === 0) continue;

    const det = document.createElement('details');
    det.className = 'text-group';
    det.open = true;
    const sum = document.createElement('summary');
    sum.innerHTML = `<strong>${groupName}</strong> <span class="muted small">${filtered.length} 项</span>`;
    det.appendChild(sum);

    const body = document.createElement('div');
    body.className = 'text-group-body';
    filtered.forEach(key => {
      const def = (I18N[textLang] && I18N[textLang][key]) || '';
      const cur = pendingTexts[textLang][key] !== undefined ? pendingTexts[textLang][key] : def;
      const isMulti = (cur.length > 60) || cur.includes('<br') || cur.includes('\n');
      const modified = (overrides[key] !== undefined) && (overrides[key] !== def);

      const row = document.createElement('div');
      row.className = 'text-row' + (modified ? ' modified' : '');
      const ctrl = isMulti
        ? `<textarea data-key="${key}" rows="3"></textarea>`
        : `<input type="text" data-key="${key}" />`;
      row.innerHTML = `<span class="key">${key}</span>${ctrl}`;

      const input = row.querySelector('[data-key]');
      input.value = cur;
      input.addEventListener('input', () => {
        pendingTexts[textLang][key] = input.value;
        const stillModified = input.value !== def && input.value !== '';
        row.classList.toggle('modified', stillModified || (overrides[key] !== undefined));
      });
      hits++;
      body.appendChild(row);
    });
    det.appendChild(body);
    wrap.appendChild(det);
  }

  if (hits === 0) {
    wrap.innerHTML = '<p class="muted small" style="padding:30px;text-align:center">未找到匹配文案</p>';
  }
}

$('#saveTexts')?.addEventListener('click', () => {
  const s = DB.getSettings();
  s.texts = s.texts || {};
  const next = {};
  Object.entries(pendingTexts[textLang] || {}).forEach(([k, v]) => {
    const def = (I18N[textLang] && I18N[textLang][k]) || '';
    if (v && v !== def) next[k] = v;
  });
  s.texts[textLang] = next;
  DB.saveSettings(s);
  const count = Object.keys(next).length;
  toast(`已保存 ${count} 条 ${textLang.toUpperCase()} 文案修改`);
  renderTextEditor();
});

$('#resetTexts')?.addEventListener('click', () => {
  if (!confirm(`确认重置 ${textLang.toUpperCase()} 文案为系统默认？所有该语言的修改将被清除。`)) return;
  const s = DB.getSettings();
  if (s.texts) delete s.texts[textLang];
  DB.saveSettings(s);
  pendingTexts[textLang] = {};
  renderTextEditor();
  toast(`${textLang.toUpperCase()} 文案已重置`);
});

/* ---------- 启动 ---------- */
if (isAuth()) showAdmin();
else showLogin();
