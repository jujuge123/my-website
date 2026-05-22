/* ============================================================
   admin.js · 后台逻辑
   依赖: db.js
   ============================================================ */

const $  = (s, r=document) => r.querySelector(s);
const $$ = (s, r=document) => [...r.querySelectorAll(s)];

/* ---------- Toast ---------- */
function toast(msg, isErr=false) {
  const el = $('#toast');
  el.textContent = msg;
  el.classList.toggle('err', isErr);
  el.classList.add('show');
  clearTimeout(toast._t);
  toast._t = setTimeout(() => el.classList.remove('show'), 2200);
}

/* ---------- 登录（本地密码门） ---------- */
function showLogin() {
  $('#loginScreen').style.display = 'flex';
  $('#adminShell').style.display = 'none';
  $('#passInput')?.focus();
}
async function showAdmin() {
  $('#loginScreen').style.display = 'none';
  $('#adminShell').style.display = 'flex';
  await refreshAll();
}

$('#loginForm').addEventListener('submit', async e => {
  e.preventDefault();
  const pass  = $('#passInput').value;
  const btn = $('#loginBtn');
  btn.disabled = true;
  $('#loginErr').textContent = '';
  try {
    if (await DB.checkAdminPass(pass)) {
      DB.setAdminAuth();
      $('#passInput').value = '';
      showAdmin();
    } else {
      $('#loginErr').textContent = '密码不正确';
      $('#passInput').value = '';
    }
  } finally {
    btn.disabled = false;
  }
});

$('#logoutBtn').addEventListener('click', () => {
  DB.clearAdminAuth();
  showLogin();
  toast('已退出登录');
});

/* ---------- 修改后台密码 ---------- */
$('#passForm')?.addEventListener('submit', async e => {
  e.preventDefault();
  const fd = new FormData(e.target);
  const oldPass = fd.get('oldPass');
  const newPass = fd.get('newPass');
  const newPass2 = fd.get('newPass2');
  const btn = e.target.querySelector('button[type="submit"]');
  if (newPass !== newPass2) { toast('两次输入的新密码不一致', true); return; }
  if (btn) btn.disabled = true;
  try {
    await DB.changeAdminPass(oldPass, newPass);
    e.target.reset();
    toast('后台密码已更新');
  } catch (err) {
    toast(err.message, true);
  } finally {
    if (btn) btn.disabled = false;
  }
});

/* ---------- 移动端侧栏抽屉 ---------- */
const shellEl = $('#adminShell');
const sideBtn = $('#sideToggle');
function openSide() {
  shellEl?.classList.add('side-open');
  sideBtn?.setAttribute('aria-expanded', 'true');
  document.body.classList.add('no-scroll');
}
function closeSide() {
  shellEl?.classList.remove('side-open');
  sideBtn?.setAttribute('aria-expanded', 'false');
  document.body.classList.remove('no-scroll');
}
function toggleSide() {
  if (shellEl?.classList.contains('side-open')) closeSide();
  else openSide();
}
sideBtn?.addEventListener('click', toggleSide);
$('#sideScrim')?.addEventListener('click', closeSide);
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeSide(); });
window.matchMedia('(min-width: 981px)').addEventListener('change', e => { if (e.matches) closeSide(); });

/* ---------- Tab 切换 ---------- */
$$('.side-nav button').forEach(b => {
  b.addEventListener('click', () => {
    $$('.side-nav button').forEach(x => x.classList.remove('active'));
    b.classList.add('active');
    const tab = b.dataset.tab;
    $$('.tab-pane').forEach(p => p.classList.remove('active'));
    $(`.tab-pane[data-pane="${tab}"]`).classList.add('active');
    $('#pageTitle').textContent = b.querySelector('span').textContent;
    if (tab === 'content') loadContentForms();
    if (tab === 'texts') renderTextEditor();
    if (tab === 'settings') loadSettingsForm();
    closeSide();
  });
});

/* Dashboard 卡片快捷跳转到对应 tab */
$$('.dash-action').forEach(card => {
  card.addEventListener('click', () => {
    const tab = card.dataset.tab;
    const btn = $(`.side-nav button[data-tab="${tab}"]`);
    if (btn) btn.click();
  });
});


/* ---------- Settings ---------- */
const wechatQRPreview = $('#wechatQRPreview');
const wechatQRInput   = $('#wechatQRInput');
const wechatQRClear   = $('#wechatQRClear');
const wechatQRStatus  = $('#wechatQRStatus');
let pendingWechatQR = null; // null=未变；''=移除；'data:...'=新图

function showWechatQR(dataUrl) {
  if (!wechatQRPreview) return;
  if (dataUrl) {
    wechatQRPreview.innerHTML = `<img src="${dataUrl}" alt="WeChat QR" />`;
    wechatQRPreview.classList.add('has-img');
  } else {
    wechatQRPreview.innerHTML = '<span class="qr-empty">未上传</span>';
    wechatQRPreview.classList.remove('has-img');
  }
}
function setQRStatus(msg, isErr) {
  if (!wechatQRStatus) return;
  wechatQRStatus.textContent = msg || '';
  wechatQRStatus.classList.toggle('err', !!isErr);
}

wechatQRInput?.addEventListener('change', e => {
  const file = e.target.files && e.target.files[0];
  if (!file) return;
  if (!file.type.startsWith('image/')) {
    setQRStatus('请选择图片文件', true);
    e.target.value = ''; return;
  }
  if (file.size > 1.5 * 1024 * 1024) {
    setQRStatus('图片过大（>1.5MB），请压缩后再上传', true);
    e.target.value = ''; return;
  }
  const reader = new FileReader();
  reader.onload = () => {
    pendingWechatQR = reader.result;
    showWechatQR(pendingWechatQR);
    setQRStatus('已选择新图，点击下方「保存」生效');
  };
  reader.onerror = () => setQRStatus('图片读取失败', true);
  reader.readAsDataURL(file);
  e.target.value = '';
});

wechatQRClear?.addEventListener('click', () => {
  pendingWechatQR = '';
  showWechatQR('');
  setQRStatus('已移除，点击下方「保存」生效');
});

function loadSettingsForm() {
  const s = DB.getSettings();
  ['wechatId','whatsappNumber','whatsappLink','lineId','lineLink'].forEach(k => {
    const el = $(`#contactForm [name="${k}"]`);
    if (el) el.value = s[k] || '';
  });
  pendingWechatQR = null;
  showWechatQR(s.wechatQR || '');
  setQRStatus('');
}

$('#contactForm').addEventListener('submit', async e => {
  e.preventDefault();
  const fd = new FormData(e.target);
  const patch = {};
  ['wechatId','whatsappNumber','whatsappLink','lineId','lineLink'].forEach(k => {
    patch[k] = fd.get(k);
  });
  if (pendingWechatQR !== null) {
    patch.wechatQR = pendingWechatQR;
  }
  const btn = e.target.querySelector('button[type="submit"]');
  if (btn) btn.disabled = true;
  try {
    await DB.saveSettings(patch);
    pendingWechatQR = null;
    setQRStatus('');
    toast('联系方式已保存，前台已同步');
  } catch (err) {
    toast('保存失败：' + err.message, true);
  } finally {
    if (btn) btn.disabled = false;
  }
});

/* ---------- 数据备份 ---------- */
$('#exportBtn').addEventListener('click', () => {
  try {
    const data = {
      settings: DB.getSettings(),
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type:'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `luxe-settings-${Date.now()}.json`; a.click();
    URL.revokeObjectURL(url);
    toast('已导出设置');
  } catch (err) { toast('导出失败：' + err.message, true); }
});

$('#importBtn').addEventListener('click', () => $('#importFile').click());
$('#importFile').addEventListener('change', async e => {
  const file = e.target.files[0]; if (!file) return;
  e.target.value = '';
  if (!confirm('确认导入此 JSON 文件？将覆盖现有设置。')) return;
  try {
    const text = await file.text();
    const data = JSON.parse(text);
    if (data.settings) await DB.saveSettings(data.settings);
    await refreshAll();
    toast('设置已导入');
  } catch (err) {
    toast('导入失败：' + err.message, true);
  }
});

/* ---------- 全局刷新 ---------- */
async function refreshAll() {
  loadSettingsForm();
}

/* ===========================================================
   内容管理（视频 + 品牌信息）
   =========================================================== */
// 预览框渲染（与前台 mountVideo 同样的识别逻辑）
function renderAdminVideoPreview(url, poster) {
  const wrap = $('#adminVideoPreview');
  if (!wrap) return;
  if (!url) { wrap.innerHTML = '<div class="qr-empty" style="padding:40px;text-align:center">请先填写视频链接</div>'; return; }
  const u = url.trim();
  let m;
  // YouTube（含 Shorts）
  if ((m = u.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|v\/|shorts\/|live\/)|youtu\.be\/)([A-Za-z0-9_-]{6,})/))) {
    wrap.innerHTML = `<iframe src="https://www.youtube.com/embed/${m[1]}?rel=0&modestbranding=1" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen" allowfullscreen style="width:100%;height:100%;border:0"></iframe>`;
    return;
  }
  // Bilibili
  if ((m = u.match(/bilibili\.com\/video\/(BV[A-Za-z0-9]+)/i))) {
    wrap.innerHTML = `<iframe src="https://player.bilibili.com/player.html?bvid=${m[1]}&high_quality=1&danmaku=0" allowfullscreen style="width:100%;height:100%;border:0"></iframe>`;
    return;
  }
  if ((m = u.match(/bilibili\.com\/video\/av(\d+)/i))) {
    wrap.innerHTML = `<iframe src="https://player.bilibili.com/player.html?aid=${m[1]}&high_quality=1&danmaku=0" allowfullscreen style="width:100%;height:100%;border:0"></iframe>`;
    return;
  }
  // Vimeo
  if ((m = u.match(/vimeo\.com\/(\d+)/))) {
    wrap.innerHTML = `<iframe src="https://player.vimeo.com/video/${m[1]}" allow="autoplay; fullscreen" allowfullscreen style="width:100%;height:100%;border:0"></iframe>`;
    return;
  }
  // 默认 mp4 直链
  wrap.innerHTML = `<video controls preload="metadata" poster="${poster || ''}" style="width:100%;height:100%;background:#000;display:block"><source src="${u}" type="video/mp4"></video>`;
}

function loadContentForms() {
  const s = DB.getSettings();
  ['videoUrl','videoPoster'].forEach(k => {
    const el = $(`#contentForm [name="${k}"]`); if (el) el.value = s[k] || '';
  });
  ['brandCN','brandEN','brandMark','siteTitle'].forEach(k => {
    const el = $(`#brandForm [name="${k}"]`); if (el) el.value = s[k] || '';
  });
  // 自动渲染预览
  renderAdminVideoPreview(s.videoUrl || '', s.videoPoster || '');
}

$('#contentForm')?.addEventListener('submit', async e => {
  e.preventDefault();
  const fd = new FormData(e.target);
  const btn = e.target.querySelector('button[type="submit"]');
  if (btn) btn.disabled = true;
  try {
    await DB.saveSettings({
      videoUrl: (fd.get('videoUrl') || '').trim(),
      videoPoster: (fd.get('videoPoster') || '').trim(),
    });
    toast('视频设置已保存，前台刷新即生效');
  } catch (err) { toast('保存失败：' + err.message, true); }
  finally { if (btn) btn.disabled = false; }
});

$('#videoPreviewBtn')?.addEventListener('click', () => {
  const url = $('#contentForm [name="videoUrl"]').value.trim();
  const poster = $('#contentForm [name="videoPoster"]').value.trim();
  if (!url) { toast('请先填写视频链接', true); return; }
  renderAdminVideoPreview(url, poster);
});

$('#brandForm')?.addEventListener('submit', async e => {
  e.preventDefault();
  const fd = new FormData(e.target);
  const patch = {};
  ['brandCN','brandEN','brandMark','siteTitle'].forEach(k => patch[k] = (fd.get(k) || '').trim());
  const btn = e.target.querySelector('button[type="submit"]');
  if (btn) btn.disabled = true;
  try {
    await DB.saveSettings(patch);
    toast('品牌信息已保存');
  } catch (err) { toast('保存失败：' + err.message, true); }
  finally { if (btn) btn.disabled = false; }
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

$('#saveTexts')?.addEventListener('click', async () => {
  const s = DB.getSettings();
  const texts = { ...(s.texts || {}) };
  const next = {};
  Object.entries(pendingTexts[textLang] || {}).forEach(([k, v]) => {
    const def = (I18N[textLang] && I18N[textLang][k]) || '';
    if (v && v !== def) next[k] = v;
  });
  texts[textLang] = next;
  try {
    await DB.saveSettings({ texts });
    const count = Object.keys(next).length;
    toast(`已保存 ${count} 条 ${textLang.toUpperCase()} 文案修改`);
    renderTextEditor();
  } catch (err) { toast('保存失败：' + err.message, true); }
});

$('#resetTexts')?.addEventListener('click', async () => {
  if (!confirm(`确认重置 ${textLang.toUpperCase()} 文案为系统默认？所有该语言的修改将被清除。`)) return;
  const s = DB.getSettings();
  const texts = { ...(s.texts || {}) };
  delete texts[textLang];
  try {
    await DB.saveSettings({ texts });
    pendingTexts[textLang] = {};
    renderTextEditor();
    toast(`${textLang.toUpperCase()} 文案已重置`);
  } catch (err) { toast('重置失败：' + err.message, true); }
});

/* ---------- 启动 ---------- */
(async function init() {
  await DB.bootstrap();
  if (DB.isAuth()) {
    await showAdmin();
  } else {
    showLogin();
  }
})();
