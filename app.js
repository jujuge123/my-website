/* ============================================================
   app.js · 主站交互
   依赖: db.js, i18n.js
   ============================================================ */

const $  = (sel, root=document) => root.querySelector(sel);
const $$ = (sel, root=document) => [...root.querySelectorAll(sel)];

/* ---------- 初始化语言 ---------- */
applyI18n();
$$('[data-lang-btn]').forEach(b => {
  if (b.dataset.langBtn === CURRENT_LANG) b.classList.add('active');
  b.addEventListener('click', () => {
    $$('[data-lang-btn]').forEach(x => x.classList.remove('active'));
    b.classList.add('active');
    setLang(b.dataset.langBtn);
    renderProducts();
    updateCartBadge();
  });
});

/* ---------- 货币格式 ---------- */
function fmtPrice(n) {
  const lang = CURRENT_LANG;
  const sym = lang === 'en' ? '¥' : lang === 'ja' ? '¥' : '¥';
  return sym + Number(n).toLocaleString();
}

/* ---------- 产品渲染 ---------- */
const productGrid = $('#productGrid');
let currentFilter = 'all';

function getProductName(p) {
  return CURRENT_LANG === 'zh' ? p.name : (p.en || p.name);
}
function getProductCat(p) {
  const map = {
    skincare: t('prod.skincare'),
    makeup:   t('prod.makeup'),
    device:   t('prod.device'),
    set:      t('prod.set'),
  };
  return map[p.cat] || p.catLabel;
}

function renderProducts() {
  const products = DB.getProducts();
  const list = currentFilter === 'all'
    ? products
    : products.filter(p => p.cat === currentFilter);
  productGrid.innerHTML = '';
  list.forEach((p, i) => {
    const card = document.createElement('div');
    card.className = 'product-card reveal';
    card.style.transitionDelay = (i * 60) + 'ms';
    card.innerHTML = `
      <div class="product-image" style="background-image:url('${p.image}')">
        ${p.tag ? `<span class="product-tag">${p.tag}</span>` : ''}
      </div>
      <div class="product-info">
        <span class="product-cat">${getProductCat(p)}</span>
        <h3 class="product-name">${getProductName(p)}</h3>
        <p class="product-en">${p.en || ''}</p>
        <div class="product-bottom">
          <span class="product-price">${fmtPrice(p.price)}<small>${fmtPrice(p.original)}</small></span>
          <span class="product-view">${t('prod.view')} →</span>
        </div>
        <div class="product-actions">
          <button class="btn-add" data-add="${p.id}">${t('prod.add')}</button>
        </div>
      </div>
    `;
    card.querySelector('.product-image').addEventListener('click', () => openProductModal(p));
    card.querySelector('.product-name').addEventListener('click', () => openProductModal(p));
    card.querySelector('.product-view').addEventListener('click', () => openProductModal(p));
    card.querySelector('.btn-add').addEventListener('click', e => {
      e.stopPropagation();
      Cart.add(p);
      const btn = e.currentTarget;
      btn.textContent = t('prod.added');
      btn.classList.add('added');
      setTimeout(() => { btn.textContent = t('prod.add'); btn.classList.remove('added'); }, 1500);
    });
    productGrid.appendChild(card);
  });
  $$('.product-card.reveal').forEach(el => observer.observe(el));
}

/* ---------- 分类筛选 ---------- */
$$('.chip').forEach(c => {
  c.addEventListener('click', () => {
    $$('.chip').forEach(x => x.classList.remove('active'));
    c.classList.add('active');
    currentFilter = c.dataset.cat;
    renderProducts();
  });
});

/* ---------- 产品详情弹窗 ---------- */
const modal = $('#modal');
let currentProductInModal = null;
function openProductModal(p) {
  currentProductInModal = p;
  $('#mImg').style.backgroundImage = `url('${p.image}')`;
  $('#mCat').textContent = getProductCat(p);
  $('#mTitle').textContent = getProductName(p);
  $('#mSubtitle').textContent = p.en || '';
  $('#mPrice').textContent = fmtPrice(p.price);
  $('#mOrig').textContent = fmtPrice(p.original);
  $('#mDesc').textContent = p.desc || '';
  $('#mFeats').innerHTML = (p.feats || []).map(f => `<li>${f}</li>`).join('');
  modal.classList.add('open');
  document.body.style.overflow = 'hidden';
}
function closeModal() {
  modal.classList.remove('open');
  document.body.style.overflow = '';
}
$('#modalClose').addEventListener('click', closeModal);
$('.modal-bg', modal).addEventListener('click', closeModal);
document.addEventListener('keydown', e => { if (e.key === 'Escape') { closeModal(); closeCart(); closeCheckout(); }});

$('#mBuy').addEventListener('click', e => {
  e.preventDefault();
  if (currentProductInModal) Cart.add(currentProductInModal);
  closeModal();
  openCart();
});
$('#mFav').addEventListener('click', e => {
  const wishlist = JSON.parse(localStorage.getItem('luxe.wish') || '[]');
  if (currentProductInModal && !wishlist.includes(currentProductInModal.id)) {
    wishlist.push(currentProductInModal.id);
    localStorage.setItem('luxe.wish', JSON.stringify(wishlist));
  }
  e.target.textContent = t('prod.faved');
  e.target.style.color = 'var(--gold)';
});

/* ---------- 购物车 ---------- */
const Cart = {
  items: DB.getCart(),
  save() { DB.saveCart(this.items); updateCartBadge(); renderCart(); },
  add(p) {
    const it = this.items.find(x => x.id === p.id);
    if (it) it.qty += 1;
    else this.items.push({ id: p.id, name: p.name, en: p.en, price: p.price, image: p.image, qty: 1 });
    this.save();
    flashCart();
  },
  remove(id) {
    this.items = this.items.filter(x => x.id !== id);
    this.save();
  },
  setQty(id, qty) {
    const it = this.items.find(x => x.id === id);
    if (!it) return;
    if (qty <= 0) this.remove(id);
    else { it.qty = qty; this.save(); }
  },
  total() {
    return this.items.reduce((s, x) => s + x.price * x.qty, 0);
  },
  count() {
    return this.items.reduce((s, x) => s + x.qty, 0);
  },
  clear() {
    this.items = []; this.save();
  },
};

function updateCartBadge() {
  const badge = $('#cartBadge');
  const c = Cart.count();
  badge.textContent = c;
  badge.style.display = c > 0 ? 'flex' : 'none';
}
function flashCart() {
  const btn = $('#cartBtn');
  btn.classList.remove('flash'); void btn.offsetWidth;
  btn.classList.add('flash');
}
function openCart() {
  $('#cartDrawer').classList.add('open');
  $('#drawerBg').classList.add('open');
  renderCart();
}
function closeCart() {
  $('#cartDrawer').classList.remove('open');
  $('#drawerBg').classList.remove('open');
}
function renderCart() {
  const body = $('#cartBody');
  if (Cart.items.length === 0) {
    body.innerHTML = `
      <div class="cart-empty">
        <svg viewBox="0 0 24 24" width="60" height="60" style="opacity:.4">
          <path fill="currentColor" d="M7 4h-2l-2 2v2h2l3 12h12l3-9h-15"/>
        </svg>
        <h4>${t('cart.empty')}</h4>
        <p class="muted">${t('cart.empty.sub')}</p>
        <button class="btn-line" onclick="closeCart()">${t('cart.continue')}</button>
      </div>`;
    $('#cartFooter').style.display = 'none';
    return;
  }
  $('#cartFooter').style.display = 'block';
  body.innerHTML = Cart.items.map(it => `
    <div class="cart-item">
      <div class="ci-img" style="background-image:url('${it.image}')"></div>
      <div class="ci-info">
        <h5>${CURRENT_LANG==='zh' ? it.name : (it.en || it.name)}</h5>
        <p class="muted">${fmtPrice(it.price)}</p>
        <div class="qty-ctrl">
          <button data-qty-dec="${it.id}">−</button>
          <span>${it.qty}</span>
          <button data-qty-inc="${it.id}">+</button>
          <button class="ci-remove" data-remove="${it.id}" title="${t('cart.remove')}">×</button>
        </div>
      </div>
      <div class="ci-total">${fmtPrice(it.price * it.qty)}</div>
    </div>
  `).join('');
  $('#cartSubtotal').textContent = fmtPrice(Cart.total());
  $('#cartTotal').textContent = fmtPrice(Cart.total());
  body.querySelectorAll('[data-qty-inc]').forEach(b => b.onclick = () => {
    const id = +b.dataset.qtyInc; const it = Cart.items.find(x=>x.id===id); Cart.setQty(id, it.qty+1);
  });
  body.querySelectorAll('[data-qty-dec]').forEach(b => b.onclick = () => {
    const id = +b.dataset.qtyDec; const it = Cart.items.find(x=>x.id===id); Cart.setQty(id, it.qty-1);
  });
  body.querySelectorAll('[data-remove]').forEach(b => b.onclick = () => Cart.remove(+b.dataset.remove));
}

$('#cartBtn').addEventListener('click', openCart);
$('#cartClose').addEventListener('click', closeCart);
$('#drawerBg').addEventListener('click', closeCart);
$('#checkoutBtn').addEventListener('click', () => { closeCart(); openCheckout(); });

/* ---------- 结算 ---------- */
function openCheckout() {
  if (Cart.items.length === 0) { openCart(); return; }
  renderCheckoutSummary();
  $('#checkoutModal').classList.add('open');
  document.body.style.overflow = 'hidden';
}
function closeCheckout() {
  $('#checkoutModal').classList.remove('open');
  document.body.style.overflow = '';
}
function renderCheckoutSummary() {
  $('#coItems').innerHTML = Cart.items.map(it => `
    <div class="co-item">
      <div class="ci-img sm" style="background-image:url('${it.image}')"></div>
      <div style="flex:1">
        <p class="co-item-name">${CURRENT_LANG==='zh' ? it.name : (it.en || it.name)}</p>
        <p class="muted small">x${it.qty}</p>
      </div>
      <div>${fmtPrice(it.price * it.qty)}</div>
    </div>
  `).join('');
  $('#coTotal').textContent = fmtPrice(Cart.total());
}

$('#coClose').addEventListener('click', closeCheckout);
$('#coBack').addEventListener('click', () => { closeCheckout(); openCart(); });

$('#checkoutForm').addEventListener('submit', e => {
  e.preventDefault();
  const fd = new FormData(e.target);
  const order = {
    customer: {
      name:    fd.get('name'),
      phone:   fd.get('phone'),
      email:   fd.get('email'),
      country: fd.get('country'),
      city:    fd.get('city'),
      address: fd.get('address'),
      zip:     fd.get('zip'),
      note:    fd.get('note'),
    },
    payment: fd.get('payment'),
    items: Cart.items.map(x => ({...x})),
    total: Cart.total(),
    lang: CURRENT_LANG,
  };
  const saved = DB.addOrder(order);
  Cart.clear();
  closeCheckout();
  showSuccess(saved);
});

/* ---------- 成功页 ---------- */
function showSuccess(order) {
  const settings = DB.getSettings();
  $('#sucNo').textContent = order.id;
  $('#sucWa').href = settings.whatsappLink;
  $('#sucWa span.id').textContent = settings.whatsappNumber;
  $('#sucLine').href = settings.lineLink;
  $('#sucLine span.id').textContent = settings.lineId;
  $('#sucWeChatId').textContent = settings.wechatId;
  $('#successModal').classList.add('open');
  document.body.style.overflow = 'hidden';
}
$('#sucClose').addEventListener('click', () => {
  $('#successModal').classList.remove('open');
  document.body.style.overflow = '';
});

/* ---------- Reveal 动画 ---------- */
const observer = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('in'); observer.unobserve(e.target); }
  });
}, { threshold: 0.12 });
$$('.reveal').forEach(el => observer.observe(el));

/* ---------- Nav 滚动 ---------- */
const nav = $('#nav');
addEventListener('scroll', () => nav.classList.toggle('scrolled', scrollY > 60));

/* ---------- 视频 ---------- */
const video = $('#brandVideo');
const vOverlay = $('#videoOverlay');
function playVideo() {
  video.play().catch(()=>{});
  vOverlay.classList.add('hidden');
  video.controls = true;
}
$('#playBtn').addEventListener('click', playVideo);
vOverlay.addEventListener('click', playVideo);
video.addEventListener('ended', () => vOverlay.classList.remove('hidden'));

/* ---------- 数字滚动 ---------- */
const statObs = new IntersectionObserver(es => {
  es.forEach(e => {
    if (!e.isIntersecting) return;
    const el = e.target;
    const target = +el.dataset.target;
    const suffix = el.dataset.suffix || '';
    const dur = 1800; const start = performance.now();
    function tick(t0) {
      const p = Math.min(1, (t0 - start) / dur);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.floor(target * eased).toLocaleString() + suffix;
      if (p < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
    statObs.unobserve(el);
  });
}, { threshold: 0.5 });
$$('.stat .num').forEach(el => statObs.observe(el));

/* ---------- 复制微信号 ---------- */
$$('.copy-btn').forEach(b => {
  b.addEventListener('click', async () => {
    const text = b.dataset.copy || DB.getSettings().wechatId;
    try { await navigator.clipboard.writeText(text); }
    catch { prompt('Copy:', text); return; }
    const orig = b.textContent;
    b.textContent = '✓ ' + text;
    b.style.background = 'var(--gold)'; b.style.color = 'var(--bg)';
    setTimeout(() => { b.textContent = orig; b.style.background=''; b.style.color=''; }, 2000);
  });
});

/* ---------- QR 生成 ---------- */
function buildQR(elId) {
  const el = $('#' + elId);
  if (!el) return;
  const link = el.dataset.link || '';
  const url = 'https://api.qrserver.com/v1/create-qr-code/?size=300x300&margin=10&color=0B0A09&bgcolor=FFFFFF&data=' + encodeURIComponent(link);
  const img = new Image();
  img.alt = 'QR'; img.src = url;
  img.onerror = () => {
    el.innerHTML = `<div style="display:flex;align-items:center;justify-content:center;height:100%;color:#0B0A09;font-family:var(--serif);font-size:14px;">${elId}</div>`;
  };
  el.innerHTML = '';
  el.appendChild(img);
}
['qrWeChat','qrWhatsApp','qrLine'].forEach(buildQR);

/* ---------- 移动菜单 ---------- */
$('#menuBtn')?.addEventListener('click', () => {
  const mnav = $('#nav nav');
  const visible = getComputedStyle(mnav).display !== 'none';
  mnav.style.display = visible ? 'none' : 'flex';
});

/* ---------- 联系信息从设置同步 ---------- */
function syncContactFromSettings() {
  const s = DB.getSettings();
  const wechatIdEl = $('#wechatIdDisplay'); if (wechatIdEl) wechatIdEl.textContent = s.wechatId;
  const waNumEl = $('#whatsappNumDisplay'); if (waNumEl) waNumEl.textContent = s.whatsappNumber;
  const lineIdEl = $('#lineIdDisplay'); if (lineIdEl) lineIdEl.textContent = s.lineId;
  const waLink = $('#whatsappLink'); if (waLink) waLink.href = s.whatsappLink;
  const lineLink = $('#lineLink'); if (lineLink) lineLink.href = s.lineLink;
  const copyBtn = $('.copy-btn[data-copy]'); if (copyBtn) copyBtn.dataset.copy = s.wechatId;
}
syncContactFromSettings();

/* ---------- 监听语言切换重新渲染购物车 ---------- */
document.addEventListener('langchange', () => { renderCart(); renderCheckoutSummary(); });

/* ---------- Newsletter ---------- */
$('#newsletterForm')?.addEventListener('submit', e => {
  e.preventDefault();
  e.target.querySelector('input').value = '';
  alert(t('footer.subscribed'));
});

/* ---------- 初始 ---------- */
updateCartBadge();
renderProducts();
