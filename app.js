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
    const lang = b.dataset.langBtn;
    $$('[data-lang-btn]').forEach(x => x.classList.toggle('active', x.dataset.langBtn === lang));
    setLang(lang);
    closeMobileMenu();
  });
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

/* ---------- 视频（支持 mp4 / YouTube / Bilibili / Vimeo） ---------- */
const video = $('#brandVideo');
const vOverlay = $('#videoOverlay');
const vEmbed = $('#videoEmbed');

// 识别视频源类型，返回 { type, embedUrl }
function parseVideoSource(url) {
  if (!url) return { type: 'none' };
  const u = url.trim();
  // YouTube（含 Shorts）
  let m = u.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|v\/|shorts\/|live\/)|youtu\.be\/)([A-Za-z0-9_-]{6,})/);
  if (m) return { type: 'youtube', embedUrl: `https://www.youtube.com/embed/${m[1]}?rel=0&modestbranding=1` };
  // Bilibili - bvid
  m = u.match(/bilibili\.com\/video\/(BV[A-Za-z0-9]+)/i);
  if (m) return { type: 'bilibili', embedUrl: `https://player.bilibili.com/player.html?bvid=${m[1]}&high_quality=1&danmaku=0` };
  // Bilibili - aid
  m = u.match(/bilibili\.com\/video\/av(\d+)/i);
  if (m) return { type: 'bilibili', embedUrl: `https://player.bilibili.com/player.html?aid=${m[1]}&high_quality=1&danmaku=0` };
  // Vimeo
  m = u.match(/vimeo\.com\/(\d+)/);
  if (m) return { type: 'vimeo', embedUrl: `https://player.vimeo.com/video/${m[1]}` };
  // 默认当 mp4 直链处理
  return { type: 'mp4', embedUrl: u };
}

// 根据 URL 挂载合适的播放器
function mountVideo(url, posterUrl) {
  const src = parseVideoSource(url);
  if (src.type === 'mp4' || src.type === 'none') {
    // 显示 <video> + overlay，隐藏 iframe
    if (vEmbed) { vEmbed.hidden = true; vEmbed.innerHTML = ''; }
    if (video) {
      video.style.display = '';
      const sourceEl = video.querySelector('source');
      if (src.embedUrl && sourceEl && sourceEl.src !== src.embedUrl) {
        sourceEl.src = src.embedUrl;
        video.load();
      }
      if (posterUrl) video.poster = posterUrl;
    }
    if (vOverlay) vOverlay.style.display = '';
  } else {
    // 隐藏 <video> + overlay，显示 iframe
    if (video) { video.pause?.(); video.style.display = 'none'; }
    if (vOverlay) vOverlay.style.display = 'none';
    if (vEmbed) {
      vEmbed.hidden = false;
      // 已挂载相同 URL 不重建（避免重复请求）
      if (vEmbed.dataset.url !== src.embedUrl) {
        vEmbed.dataset.url = src.embedUrl;
        vEmbed.innerHTML = `<iframe src="${src.embedUrl}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen" allowfullscreen referrerpolicy="strict-origin-when-cross-origin" loading="lazy"></iframe>`;
      }
    }
  }
}

function playVideo() {
  if (!video || video.style.display === 'none') return;
  video.play().catch(()=>{});
  vOverlay?.classList.add('hidden');
  video.controls = true;
}
$('#playBtn')?.addEventListener('click', playVideo);
vOverlay?.addEventListener('click', playVideo);
video?.addEventListener('ended', () => vOverlay?.classList.remove('hidden'));

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

/* ---------- 复制工具 ---------- */
async function copyText(text) {
  try { await navigator.clipboard.writeText(text); return true; }
  catch {
    // 兜底：用临时 textarea
    try {
      const ta = document.createElement('textarea');
      ta.value = text; ta.style.position = 'fixed'; ta.style.opacity = '0';
      document.body.appendChild(ta); ta.select();
      document.execCommand('copy'); document.body.removeChild(ta);
      return true;
    } catch { return false; }
  }
}

/* ---------- 复制微信号按钮 ---------- */
$('#wechatCopyBtn')?.addEventListener('click', async e => {
  e.preventDefault();
  const btn = e.currentTarget;
  const id = btn.dataset.copy || DB.getSettings().wechatId || '';
  const ok = await copyText(id);
  const span = btn.querySelector('span');
  const orig = span ? span.textContent : btn.textContent;
  if (span) span.textContent = ok ? `✓ ${id}` : id;
  else btn.textContent = ok ? `✓ ${id}` : id;
  btn.classList.add('added');
  setTimeout(() => {
    if (span) span.textContent = orig; else btn.textContent = orig;
    btn.classList.remove('added');
  }, 2200);
});

/* ---------- 移动菜单 ---------- */
const navEl = $('#nav');
const menuBtn = $('#menuBtn');
function openMobileMenu() {
  if (!navEl) return;
  navEl.classList.add('menu-open');
  menuBtn?.setAttribute('aria-expanded', 'true');
  document.body.classList.add('no-scroll');
}
function closeMobileMenu() {
  if (!navEl) return;
  navEl.classList.remove('menu-open');
  menuBtn?.setAttribute('aria-expanded', 'false');
  document.body.classList.remove('no-scroll');
}
function toggleMobileMenu() {
  if (navEl?.classList.contains('menu-open')) closeMobileMenu();
  else openMobileMenu();
}
menuBtn?.addEventListener('click', toggleMobileMenu);
$('#navScrim')?.addEventListener('click', closeMobileMenu);
/* 点击菜单内导航链接自动收起 */
$$('#mainNav a').forEach(a => a.addEventListener('click', closeMobileMenu));
/* Esc 关闭 */
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeMobileMenu(); });
/* 切到桌面尺寸时确保收起 */
window.matchMedia('(min-width: 721px)').addEventListener('change', e => { if (e.matches) closeMobileMenu(); });

/* ---------- 联系信息 / 视频 / 品牌：从 settings 同步 ---------- */
function syncFromSettings() {
  const s = DB.getSettings();

  // === 微信卡 ===
  const wechatIdEl = $('#wechatIdDisplay'); if (wechatIdEl) wechatIdEl.textContent = s.wechatId || '';
  const wechatCopyBtn = $('#wechatCopyBtn'); if (wechatCopyBtn) wechatCopyBtn.dataset.copy = s.wechatId || '';

  // === WhatsApp 卡 ===
  const waLink = $('#contactWhatsApp'); if (waLink && s.whatsappLink) waLink.href = s.whatsappLink;
  const waNumEl = $('#whatsappNumberDisplay'); if (waNumEl) waNumEl.textContent = s.whatsappNumber || '';

  // === LINE 卡 ===
  const lineLink = $('#contactLine'); if (lineLink && s.lineLink) lineLink.href = s.lineLink;
  const lineIdEl = $('#lineIdDisplay'); if (lineIdEl) lineIdEl.textContent = s.lineId || '';

  // 视频（自动识别 mp4 / YouTube / Bilibili / Vimeo）
  if (s.videoUrl) mountVideo(s.videoUrl, s.videoPoster);

  // 品牌名（多处）
  if (s.brandCN) $$('.brand-cn').forEach(el => el.textContent = s.brandCN);
  if (s.brandEN) $$('.brand-en').forEach(el => el.textContent = el.textContent.includes('GLOBAL') ? s.brandEN + ' · GLOBAL' : s.brandEN);
  if (s.brandMark) $$('.brand-mark').forEach(el => el.textContent = s.brandMark);
  if (s.siteTitle) document.title = s.siteTitle;
}
/* 后台另一标签页改了 settings → 前台自动同步 */
window.addEventListener('storage', e => {
  if (!e.key) return;
  if (e.key === DB.KEYS.SETTINGS) {
    syncFromSettings();
    if (typeof applyI18n === 'function') applyI18n();
  }
});

/* DB bootstrap 完成后重新渲染 */
document.addEventListener('db-ready', () => {
  syncFromSettings();
  if (typeof applyI18n === 'function') applyI18n();
});

/* ---------- Newsletter ---------- */
$('#newsletterForm')?.addEventListener('submit', e => {
  e.preventDefault();
  e.target.querySelector('input').value = '';
  alert(t('footer.subscribed'));
});

/* ---------- 初始 ---------- */
(async function init() {
  // 先走本地缓存渲染一遍（避免首屏空白）
  if (typeof DB._loadLocal === 'function') DB._loadLocal();
  syncFromSettings();
  // 再异步拉云端，拉完会触发 db-ready 事件重新渲染
  try {
    await DB.bootstrap();
  } catch (err) {
    console.warn('[app] bootstrap failed', err);
  }
})();
