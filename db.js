/* ============================================================
   db.js · 共享数据层（Supabase 云端 + localStorage 缓存）
   读：同步（从内存缓存，bootstrap 后即可用）
   写：异步（await，写云端并更新缓存）
   被 index.html / admin.html 共同引用
   ============================================================ */

/* ---------- DB 主体 ---------- */
const DB = {
  KEYS: {
    SETTINGS:    'luxe.cache.settings',
    LANG:        'luxe.lang',
  },

  cache: {
    settings: null,
  },
  _session: null,
  _bootstrapPromise: null,

  defaultSettings: {
    currency: 'CNY',
    wechatId: 'SCMY5333',
    wechatQR: '',
    whatsappNumber: '+86 138 2397 4479',
    whatsappLink: 'https://wa.me/8613823974479',
    lineId: 'shechi666888',
    lineLink: 'https://line.me/ti/p/yhj6axsxG7',
    videoUrl: 'https://youtube.com/shorts/-RoS03jxXcc',
    videoPoster: '',
    brandCN: '奢驰美颜',
    brandEN: 'LUXE CHI BEAUTY',
    brandMark: 'L · C',
    siteTitle: '奢驰美颜 · 全球运营中心 | LUXE CHI BEAUTY',
    // 后台密码（SHA-256 hash）。要改密码：让管理员改 db.js 默认值或在后台改密码
    adminPassHash: '597b40f79ac45814e08c5ec8c3fbe3fd996e338a8d1755b709a154f23f4109de',
    texts: {},
  },

  /* ---------- Bootstrap ---------- */
  async bootstrap() {
    if (this._bootstrapPromise) return this._bootstrapPromise;
    this._bootstrapPromise = (async () => {
      // 1) 先从 localStorage 读缓存，让首屏快速渲染
      this._loadLocal();
      // 2) 再请求 Supabase，覆盖缓存
      try {
        await this._loadCloud();
        document.dispatchEvent(new CustomEvent('db-ready', { detail: { source: 'cloud' } }));
      } catch (err) {
        console.warn('[DB] 云端加载失败，已使用本地缓存：', err);
        document.dispatchEvent(new CustomEvent('db-ready', { detail: { source: 'local', error: err } }));
      }
      // 3) 同步当前登录态
      try {
        const { data } = await window.SB.auth.getSession();
        this._session = data.session;
      } catch {}
      // 4) 监听登录态变化
      window.SB.auth.onAuthStateChange((_evt, session) => {
        this._session = session;
        document.dispatchEvent(new CustomEvent('db-auth', { detail: session }));
      });
    })();
    return this._bootstrapPromise;
  },

  _loadLocal() {
    try {
      const s = JSON.parse(localStorage.getItem(this.KEYS.SETTINGS) || 'null');
      this.cache.settings = { ...this.defaultSettings, ...(s || {}) };
    } catch {
      this.cache.settings = { ...this.defaultSettings };
    }
  },

  _saveLocal() {
    try {
      localStorage.setItem(this.KEYS.SETTINGS, JSON.stringify(this.cache.settings));
    } catch (e) {
      console.warn('[DB] 写入本地缓存失败：', e);
    }
  },

  async _loadCloud() {
    const { data, error } = await window.SB.from('settings').select('value').eq('key', 'global').maybeSingle();
    if (error) throw error;
    this.cache.settings = { ...this.defaultSettings, ...((data && data.value) || {}) };
    this._saveLocal();
  },

  /* ---------- Settings ---------- */
  getSettings() {
    return { ...(this.cache.settings || this.defaultSettings) };
  },

  async saveSettings(patch) {
    const merged = { ...this.cache.settings, ...patch };
    this.cache.settings = merged;
    this._saveLocal();
    // 尝试同步到云端（如果 RLS 允许 anon 写），失败静默忽略
    try {
      if (window.SB) {
        await window.SB.from('settings').upsert({
          key: 'global',
          value: merged,
          updated_at: new Date().toISOString(),
        });
      }
    } catch (e) {
      console.info('[DB] 云端同步跳过（仅本地保存）:', e.message);
    }
    return merged;
  },

  /* ---------- Lang（个性化） ---------- */
  getLang()       { return localStorage.getItem(this.KEYS.LANG) || 'zh'; },
  setLang(l)      { localStorage.setItem(this.KEYS.LANG, l); },

  /* ---------- Auth（本地密码门） ---------- */
  ADMIN_SESSION_KEY: 'luxe.admin.session',

  // SHA-256 hex（基于 Web Crypto，所有现代浏览器原生支持）
  async _sha256(text) {
    const buf = new TextEncoder().encode(text);
    const hash = await crypto.subtle.digest('SHA-256', buf);
    return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, '0')).join('');
  },

  // 验证密码是否正确（支持新 hash 字段 + 旧明文字段兼容）
  async checkAdminPass(pass) {
    const s = this.cache.settings || this.defaultSettings;
    const expectedHash = s.adminPassHash || this.defaultSettings.adminPassHash;
    const givenHash = await this._sha256(pass || '');
    if (expectedHash && givenHash === expectedHash) return true;
    // 兼容旧版：本地缓存里如果还有明文 adminPass，也允许一次（自动迁移）
    if (s.adminPass && pass === s.adminPass) {
      try { await this.saveSettings({ adminPassHash: givenHash, adminPass: undefined }); } catch {}
      return true;
    }
    return false;
  },
  // 登录成功后标记 session
  setAdminAuth() { sessionStorage.setItem(this.ADMIN_SESSION_KEY, '1'); },
  clearAdminAuth() { sessionStorage.removeItem(this.ADMIN_SESSION_KEY); },
  isAuth() { return sessionStorage.getItem(this.ADMIN_SESSION_KEY) === '1'; },
  user() { return this.isAuth() ? { email: '后台管理员' } : null; },

  // 修改后台密码（保存 hash）
  async changeAdminPass(oldPass, newPass) {
    const ok = await this.checkAdminPass(oldPass);
    if (!ok) throw new Error('当前密码不正确');
    if (!newPass || newPass.length < 6) throw new Error('新密码至少 6 位');
    const newHash = await this._sha256(newPass);
    await this.saveSettings({ adminPassHash: newHash, adminPass: undefined });
  },

  /* ---------- Media（小图转 base64，避免 Storage 鉴权） ---------- */
  async uploadMedia(file) {
    if (!file) throw new Error('未选择文件');
    if (!file.type.startsWith('image/')) throw new Error('仅支持图片');
    if (file.size > 1.5 * 1024 * 1024) throw new Error('图片超过 1.5MB，请压缩后再传');
    return await new Promise((resolve, reject) => {
      const r = new FileReader();
      r.onload = () => resolve(r.result);
      r.onerror = () => reject(new Error('图片读取失败'));
      r.readAsDataURL(file);
    });
  },
};
