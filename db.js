/* ============================================================
   db.js · 共享数据层 (localStorage)
   被 index.html / admin.html 共同引用
   ============================================================ */

const DEFAULT_PRODUCTS = [
  {
    id: 1, name: "黑松露·赋活精华", en: "Black Truffle Revitalizing Serum",
    cat: "skincare", catLabel: "奢护精华", tag: "限量",
    price: 4880, original: 6280, stock: 88,
    image: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=900&q=80&auto=format&fit=crop",
    desc: "源自意大利阿尔巴黑松露，融合瑞士专利胜肽科技。深层赋活，72 小时持续焕亮。",
    feats: ["阿尔巴黑松露萃取", "瑞士胜肽 SH-Polypeptide-9", "院线级渗透科技", "30ml · 限量编号瓶"]
  },
  {
    id: 2, name: "钻石·焕颜面霜", en: "Diamond Radiance Cream",
    cat: "skincare", catLabel: "奢护精华", tag: "TOP",
    price: 6880, original: 7980, stock: 50,
    image: "https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=900&q=80&auto=format&fit=crop",
    desc: "钻石微粒折光科技，瞬间提亮肤色，长效紧致。皇室御用配方，奢华质地一抹倾心。",
    feats: ["钻石微粒折光", "鱼子精华浓度 18%", "金缕梅花瓣油", "50ml 水晶瓶身"]
  },
  {
    id: 3, name: "玫瑰·凝萃眼霜", en: "Damask Rose Eye Concentrate",
    cat: "skincare", catLabel: "奢护精华", tag: "热销",
    price: 2680, original: 3280, stock: 120,
    image: "https://images.unsplash.com/photo-1631730486784-3edc2a988dca?w=900&q=80&auto=format&fit=crop",
    desc: "保加利亚大马士革玫瑰，72 朵浓缩 1 滴。淡纹紧致，唤醒眼周年轻光彩。",
    feats: ["玫瑰花瓣冷萃", "蓝铜胜肽紧致", "黄金按摩头", "20ml 礼盒装"]
  },
  {
    id: 4, name: "高定·烈焰唇釉", en: "Couture Velvet Lip Lacquer",
    cat: "makeup", catLabel: "高定彩妆", tag: "新品",
    price: 880, original: 1080, stock: 200,
    image: "https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=900&q=80&auto=format&fit=crop",
    desc: "丝缎雾面质感，12 小时持色不脱妆。法国高定香水世家联名设计。",
    feats: ["丝绒哑光质感", "12 色高定色卡", "玫瑰精油配方", "雕花金属外壳"]
  },
  {
    id: 5, name: "射频·美容仪 Pro", en: "RF Beauty Device · Pro",
    cat: "device", catLabel: "美容仪器", tag: "院线级",
    price: 12800, original: 15800, stock: 30,
    image: "https://images.unsplash.com/photo-1631549916768-4119b2e5f926?w=900&q=80&auto=format&fit=crop",
    desc: "六极射频 + EMS 微电流，院线级抗衰科技家用化。8 周使法令纹可见淡化 47%。",
    feats: ["六极射频科技", "EMS 微电流", "LED 三色光疗", "FDA / CE 双重认证"]
  },
  {
    id: 6, name: "尊享·全球臻礼盒", en: "Global Signature Gift Set",
    cat: "set", catLabel: "尊享礼盒", tag: "至臻",
    price: 18800, original: 23800, stock: 15,
    image: "https://images.unsplash.com/photo-1607008829749-c0f284a49841?w=900&q=80&auto=format&fit=crop",
    desc: "甄选品牌六大臻品，配以东方漆器礼盒与定制丝绸袋，是送给挚爱的最高致意。",
    feats: ["六件臻品组合", "东方漆器礼盒", "定制烫金贺卡", "全球免邮配送"]
  }
];

const DB = {
  KEYS: {
    PRODUCTS: 'luxe.products.v1',
    ORDERS:   'luxe.orders.v1',
    SETTINGS: 'luxe.settings.v1',
    CART:     'luxe.cart.v1',
    LANG:     'luxe.lang',
  },

  init() {
    if (!localStorage.getItem(this.KEYS.PRODUCTS))
      this.saveProducts(DEFAULT_PRODUCTS);
    if (!localStorage.getItem(this.KEYS.SETTINGS))
      this.saveSettings({
        adminPass: 'luxe2025',
        currency: 'CNY',
        wechatId: 'LuxeChi_VIP',
        whatsappNumber: '+852 1234 5678',
        whatsappLink: 'https://wa.me/85212345678',
        lineId: '@LuxeChi',
        lineLink: 'https://line.me/ti/p/~LuxeChi',
      });
  },

  // ---- Products ----
  getProducts() {
    return JSON.parse(localStorage.getItem(this.KEYS.PRODUCTS) || '[]');
  },
  saveProducts(arr) {
    localStorage.setItem(this.KEYS.PRODUCTS, JSON.stringify(arr));
  },
  upsertProduct(p) {
    const list = this.getProducts();
    if (p.id) {
      const i = list.findIndex(x => x.id === p.id);
      if (i >= 0) list[i] = p; else list.push(p);
    } else {
      p.id = Date.now();
      list.push(p);
    }
    this.saveProducts(list);
    return p;
  },
  deleteProduct(id) {
    this.saveProducts(this.getProducts().filter(p => p.id !== id));
  },
  resetProducts() {
    this.saveProducts(DEFAULT_PRODUCTS);
  },

  // ---- Orders ----
  getOrders() {
    return JSON.parse(localStorage.getItem(this.KEYS.ORDERS) || '[]');
  },
  saveOrders(arr) {
    localStorage.setItem(this.KEYS.ORDERS, JSON.stringify(arr));
  },
  addOrder(o) {
    const list = this.getOrders();
    const order = {
      id: 'LX' + Date.now().toString(36).toUpperCase(),
      createdAt: Date.now(),
      status: 'pending',
      ...o,
    };
    list.unshift(order);
    this.saveOrders(list);
    return order;
  },
  updateOrder(id, patch) {
    const list = this.getOrders();
    const o = list.find(x => x.id === id);
    if (o) Object.assign(o, patch);
    this.saveOrders(list);
    return o;
  },
  deleteOrder(id) {
    this.saveOrders(this.getOrders().filter(o => o.id !== id));
  },

  // ---- Settings ----
  getSettings() {
    return JSON.parse(localStorage.getItem(this.KEYS.SETTINGS) || '{}');
  },
  saveSettings(s) {
    localStorage.setItem(this.KEYS.SETTINGS, JSON.stringify(s));
  },

  // ---- Cart ----
  getCart() {
    return JSON.parse(localStorage.getItem(this.KEYS.CART) || '[]');
  },
  saveCart(arr) {
    localStorage.setItem(this.KEYS.CART, JSON.stringify(arr));
  },
  clearCart() {
    localStorage.removeItem(this.KEYS.CART);
  },

  // ---- Lang ----
  getLang() {
    return localStorage.getItem(this.KEYS.LANG) || 'zh';
  },
  setLang(l) {
    localStorage.setItem(this.KEYS.LANG, l);
  },
};

DB.init();
