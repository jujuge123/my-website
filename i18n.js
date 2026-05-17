/* ============================================================
   i18n.js · 多语言资源 (中 / English / 日本語)
   用法：在 HTML 元素加 data-i18n="key"，调用 applyI18n()
   ============================================================ */

const I18N = {
  zh: {
    'nav.brand': '品牌',
    'nav.video': '影像',
    'nav.products': '臻品',
    'nav.stats': '实力',
    'nav.contact': '联系',
    'nav.consult': '立即咨询',
    'nav.cart': '购物车',
    'nav.admin': '后台',

    'hero.eyebrow': 'EST · GLOBAL OPERATIONS CENTER',
    'hero.subtitle': '全球运营中心',
    'hero.tagline1': '臻选世界 · 雕琢东方之美',
    'hero.tagline2': 'Where Heritage Meets Modern Luxury',
    'hero.cta1': '联系我们',
    'hero.cta2': '观看影像',
    'hero.scroll': 'SCROLL',

    'about.tag': '关于品牌 · ABOUT',
    'about.title': '以奢驰之名<br/>诠释美的极致追求',
    'about.lead': '奢驰美颜全球运营中心，专注于国际高奢美妆品牌的全球甄选与渠道运营。我们以"匠心工艺、臻稀原料、科技赋能"为核心理念，甄选源自法国、瑞士、日本及韩国的顶级护肤与美容科技产品，服务全球超过 <strong>50 个国家</strong>的高净值客户。',
    'about.f1.title': '全球供应链',
    'about.f1.desc': '直采欧美亚顶级原产地，源头品质保证',
    'about.f2.title': '专属定制',
    'about.f2.desc': '1对1美学顾问 · 私人肌肤档案管理',
    'about.f3.title': '科技美容',
    'about.f3.desc': '同步纽约、首尔最新院线级美容方案',

    'video.tag': '品牌影像 · FEATURE FILM',
    'video.title': '于光影之间 · 见证奢华',
    'video.sub': 'A visual journey through craftsmanship, elegance, and timeless beauty.',
    'video.caption': '奢驰美颜 · 2025 品牌大片',

    'prod.tag': '臻品系列 · COLLECTION',
    'prod.title': '全球甄选 · 限量臻品',
    'prod.sub': '每一件，皆为时间与匠心的对话。',
    'prod.all': '全部',
    'prod.skincare': '奢护精华',
    'prod.makeup': '高定彩妆',
    'prod.device': '美容仪器',
    'prod.set': '尊享礼盒',
    'prod.view': '查看',
    'prod.add': '加入购物车',
    'prod.added': '✓ 已加入',
    'prod.buy': '立即购买',
    'prod.fav': '♡ 心愿单',
    'prod.faved': '♥ 已收藏',

    'stats.countries': '服务国家与地区',
    'stats.clients': 'VIP 尊享客户',
    'stats.retention': '客户复购率',
    'stats.years': '深耕年份',

    'contact.tag': '联系我们 · CONTACT',
    'contact.title': '尊享一对一咨询',
    'contact.sub': '7 × 24 小时全球美学顾问 · 中文 / English / 日本語',
    'contact.wechat.desc': '专属顾问即时响应',
    'contact.wechat.btn.copy': '复制微信号',
    'contact.whatsapp.desc': '国际客户首选 · 全球即时通讯',
    'contact.whatsapp.btn.go': '立即对话',
    'contact.line.desc': '日韩 · 东南亚客户专属',
    'contact.line.btn.go': '前往 LINE',

    'cart.title': '购物车',
    'cart.empty': '购物车空空如也',
    'cart.empty.sub': '去添加心仪臻品吧',
    'cart.subtotal': '小计',
    'cart.shipping': '配送',
    'cart.shipping.free': '全球免邮',
    'cart.total': '合计',
    'cart.checkout': '前往结算',
    'cart.continue': '继续购物',
    'cart.remove': '移除',

    'co.title': '订单结算',
    'co.contact': '联系信息',
    'co.name': '姓名',
    'co.phone': '电话',
    'co.email': '邮箱',
    'co.shipping': '配送信息',
    'co.country': '国家 / 地区',
    'co.city': '城市',
    'co.address': '详细地址',
    'co.zip': '邮编',
    'co.note': '订单备注（选填）',
    'co.payment': '支付方式',
    'co.pay.wechat': '微信支付',
    'co.pay.alipay': '支付宝',
    'co.pay.whatsapp': 'WhatsApp 协助下单',
    'co.pay.line': 'LINE Pay',
    'co.pay.bank': '银行电汇',
    'co.summary': '订单摘要',
    'co.submit': '提交订单',
    'co.back': '返回购物车',

    'success.title': '订单提交成功',
    'success.sub': '感谢您的信任，专属顾问将在 30 分钟内与您联系完成支付与物流确认。',
    'success.no': '订单编号',
    'success.contact': '请通过以下方式联系顾问完成支付',
    'success.close': '完成',

    'footer.nav': '导航',
    'footer.office': '全球办公',
    'footer.subscribe': '订阅资讯',
    'footer.subscribed': '感谢订阅 ❤',
    'footer.copy': '© 2025 LUXE CHI BEAUTY · 奢驰美颜全球运营中心 · All Rights Reserved.',
    'footer.craft': 'Crafted with elegance.',
  },

  en: {
    'nav.brand': 'Brand',
    'nav.video': 'Film',
    'nav.products': 'Collection',
    'nav.stats': 'Heritage',
    'nav.contact': 'Contact',
    'nav.consult': 'Consult Now',
    'nav.cart': 'Cart',
    'nav.admin': 'Admin',

    'hero.eyebrow': 'EST · GLOBAL OPERATIONS CENTER',
    'hero.subtitle': 'Global Operations Center',
    'hero.tagline1': 'Curated Globally · Crafted with Oriental Soul',
    'hero.tagline2': 'Where Heritage Meets Modern Luxury',
    'hero.cta1': 'Contact Us',
    'hero.cta2': 'Watch Film',
    'hero.scroll': 'SCROLL',

    'about.tag': 'ABOUT THE HOUSE',
    'about.title': 'In the Name of Luxe Chi<br/>Pursuing the Pinnacle of Beauty',
    'about.lead': 'LUXE CHI BEAUTY Global Operations Center specializes in international premium beauty brand curation and channel operations. Guided by craftsmanship, rare ingredients, and beauty-tech innovation, we curate top-tier skincare and devices from France, Switzerland, Japan, and Korea—serving high-net-worth clients in over <strong>50 countries</strong> worldwide.',
    'about.f1.title': 'Global Supply Chain',
    'about.f1.desc': 'Direct sourcing from premier origins across continents',
    'about.f2.title': 'Personalized Service',
    'about.f2.desc': '1-on-1 aesthetic advisor · Private skin profile',
    'about.f3.title': 'Beauty Technology',
    'about.f3.desc': 'Synced with the latest clinical-grade protocols',

    'video.tag': 'FEATURE FILM',
    'video.title': 'Between Light and Shadow · Witness Luxury',
    'video.sub': 'A visual journey through craftsmanship, elegance, and timeless beauty.',
    'video.caption': 'LUXE CHI · 2025 Brand Film',

    'prod.tag': 'THE COLLECTION',
    'prod.title': 'Globally Curated · Limited Editions',
    'prod.sub': 'Each piece is a dialogue between time and craftsmanship.',
    'prod.all': 'All',
    'prod.skincare': 'Skincare',
    'prod.makeup': 'Makeup',
    'prod.device': 'Devices',
    'prod.set': 'Gift Sets',
    'prod.view': 'View',
    'prod.add': 'Add to Cart',
    'prod.added': '✓ Added',
    'prod.buy': 'Buy Now',
    'prod.fav': '♡ Wishlist',
    'prod.faved': '♥ Saved',

    'stats.countries': 'Countries Served',
    'stats.clients': 'VIP Clients',
    'stats.retention': 'Retention Rate',
    'stats.years': 'Years of Heritage',

    'contact.tag': 'CONTACT',
    'contact.title': 'Exclusive 1-on-1 Consultation',
    'contact.sub': '24/7 Global Beauty Advisor · 中文 / English / 日本語',
    'contact.wechat.desc': 'Instant advisor response',
    'contact.wechat.btn.copy': 'Copy WeChat ID',
    'contact.whatsapp.desc': 'Preferred by international clients',
    'contact.whatsapp.btn.go': 'Chat Now',
    'contact.line.desc': 'For JP / KR / SEA clients',
    'contact.line.btn.go': 'Open LINE',

    'cart.title': 'Shopping Cart',
    'cart.empty': 'Your cart is empty',
    'cart.empty.sub': 'Add some luxurious treasures',
    'cart.subtotal': 'Subtotal',
    'cart.shipping': 'Shipping',
    'cart.shipping.free': 'Worldwide Free',
    'cart.total': 'Total',
    'cart.checkout': 'Checkout',
    'cart.continue': 'Continue Shopping',
    'cart.remove': 'Remove',

    'co.title': 'Checkout',
    'co.contact': 'Contact Information',
    'co.name': 'Full Name',
    'co.phone': 'Phone',
    'co.email': 'Email',
    'co.shipping': 'Shipping Address',
    'co.country': 'Country / Region',
    'co.city': 'City',
    'co.address': 'Street Address',
    'co.zip': 'Postal Code',
    'co.note': 'Order Notes (Optional)',
    'co.payment': 'Payment Method',
    'co.pay.wechat': 'WeChat Pay',
    'co.pay.alipay': 'Alipay',
    'co.pay.whatsapp': 'WhatsApp Assisted',
    'co.pay.line': 'LINE Pay',
    'co.pay.bank': 'Wire Transfer',
    'co.summary': 'Order Summary',
    'co.submit': 'Place Order',
    'co.back': 'Back to Cart',

    'success.title': 'Order Placed Successfully',
    'success.sub': 'Thank you. Our advisor will contact you within 30 minutes to confirm payment and shipping.',
    'success.no': 'Order Number',
    'success.contact': 'Please contact our advisor via:',
    'success.close': 'Done',

    'footer.nav': 'Navigation',
    'footer.office': 'Global Offices',
    'footer.subscribe': 'Newsletter',
    'footer.subscribed': 'Thank you for subscribing ❤',
    'footer.copy': '© 2025 LUXE CHI BEAUTY · Global Operations Center · All Rights Reserved.',
    'footer.craft': 'Crafted with elegance.',
  },

  ja: {
    'nav.brand': 'ブランド',
    'nav.video': '映像',
    'nav.products': '商品',
    'nav.stats': '実績',
    'nav.contact': 'お問合せ',
    'nav.consult': 'ご相談',
    'nav.cart': 'カート',
    'nav.admin': '管理',

    'hero.eyebrow': 'EST · GLOBAL OPERATIONS CENTER',
    'hero.subtitle': 'グローバル運営センター',
    'hero.tagline1': '世界を厳選 · 東洋の美を磨く',
    'hero.tagline2': 'Where Heritage Meets Modern Luxury',
    'hero.cta1': 'お問合せ',
    'hero.cta2': '映像を観る',
    'hero.scroll': 'SCROLL',

    'about.tag': 'ブランドについて',
    'about.title': 'LUXE CHIの名のもとに<br/>美の極致を追求する',
    'about.lead': '奢驰美颜グローバル運営センターは、国際的な高級美容ブランドのグローバル選定とチャネル運営に特化しています。匠の技、希少な原料、テクノロジーの融合を理念とし、フランス、スイス、日本、韓国のトップクラスのスキンケアと美容機器を厳選し、世界<strong>50カ国以上</strong>の富裕層クライアントにサービスを提供しています。',
    'about.f1.title': 'グローバル供給網',
    'about.f1.desc': '世界の一流原産地から直接調達',
    'about.f2.title': 'パーソナライズ',
    'about.f2.desc': '専属美容アドバイザー · 個人カルテ管理',
    'about.f3.title': '美容テクノロジー',
    'about.f3.desc': 'ニューヨーク・ソウルの最新プロトコル',

    'video.tag': 'ブランド映像',
    'video.title': '光と影の中で · 贅沢を体験',
    'video.sub': '匠の技、エレガンス、永遠の美への視覚的な旅。',
    'video.caption': 'LUXE CHI · 2025 ブランドフィルム',

    'prod.tag': 'コレクション',
    'prod.title': 'グローバル厳選 · 限定品',
    'prod.sub': '一品一品が、時間と匠の対話。',
    'prod.all': 'すべて',
    'prod.skincare': 'スキンケア',
    'prod.makeup': 'メイクアップ',
    'prod.device': '美容機器',
    'prod.set': 'ギフトセット',
    'prod.view': '詳細',
    'prod.add': 'カートに追加',
    'prod.added': '✓ 追加済み',
    'prod.buy': '今すぐ購入',
    'prod.fav': '♡ ウィッシュ',
    'prod.faved': '♥ 保存済み',

    'stats.countries': 'サービス対象国',
    'stats.clients': 'VIPクライアント',
    'stats.retention': 'リピート率',
    'stats.years': '実績年数',

    'contact.tag': 'お問合せ',
    'contact.title': '専属1対1コンサルティング',
    'contact.sub': '24時間グローバル美容アドバイザー · 中文 / English / 日本語',
    'contact.wechat.desc': '専属アドバイザーが即時対応',
    'contact.wechat.btn.copy': 'WeChat IDをコピー',
    'contact.whatsapp.desc': '海外クライアント向け',
    'contact.whatsapp.btn.go': '今すぐチャット',
    'contact.line.desc': '日韓・東南アジア専用',
    'contact.line.btn.go': 'LINEを開く',

    'cart.title': 'ショッピングカート',
    'cart.empty': 'カートは空です',
    'cart.empty.sub': '素敵な商品を追加しましょう',
    'cart.subtotal': '小計',
    'cart.shipping': '配送料',
    'cart.shipping.free': '世界中送料無料',
    'cart.total': '合計',
    'cart.checkout': 'レジへ進む',
    'cart.continue': '買い物を続ける',
    'cart.remove': '削除',

    'co.title': 'ご注文手続き',
    'co.contact': '連絡先情報',
    'co.name': 'お名前',
    'co.phone': '電話番号',
    'co.email': 'メール',
    'co.shipping': '配送先住所',
    'co.country': '国 / 地域',
    'co.city': '市区町村',
    'co.address': '番地・建物名',
    'co.zip': '郵便番号',
    'co.note': '備考（任意）',
    'co.payment': 'お支払い方法',
    'co.pay.wechat': 'WeChat Pay',
    'co.pay.alipay': 'Alipay',
    'co.pay.whatsapp': 'WhatsAppサポート',
    'co.pay.line': 'LINE Pay',
    'co.pay.bank': '銀行振込',
    'co.summary': '注文概要',
    'co.submit': '注文を確定',
    'co.back': 'カートに戻る',

    'success.title': 'ご注文が完了しました',
    'success.sub': 'ご利用ありがとうございます。30分以内に専属アドバイザーよりご連絡いたします。',
    'success.no': '注文番号',
    'success.contact': '以下よりお支払いをご連絡ください：',
    'success.close': '完了',

    'footer.nav': 'ナビゲーション',
    'footer.office': 'グローバルオフィス',
    'footer.subscribe': 'ニュースレター',
    'footer.subscribed': 'ご登録ありがとうございます ❤',
    'footer.copy': '© 2025 LUXE CHI BEAUTY · グローバル運営センター · All Rights Reserved.',
    'footer.craft': 'Crafted with elegance.',
  },
};

let CURRENT_LANG = (typeof DB !== 'undefined') ? DB.getLang() : 'zh';

function t(key) {
  // 后台覆盖优先
  if (typeof DB !== 'undefined') {
    const overrides = DB.getSettings().texts || {};
    const langOv = overrides[CURRENT_LANG] || {};
    if (langOv[key] !== undefined && langOv[key] !== '') return langOv[key];
  }
  return (I18N[CURRENT_LANG] && I18N[CURRENT_LANG][key]) || I18N.zh[key] || key;
}

// 暴露给 admin 用的可编辑文案分组
const TEXT_GROUPS = {
  '导航 Nav': ['nav.brand','nav.video','nav.stats','nav.contact','nav.consult','nav.admin'],
  'Hero 首屏': ['hero.eyebrow','hero.subtitle','hero.tagline1','hero.tagline2','hero.cta1','hero.cta2','hero.scroll'],
  '关于品牌 About': ['about.tag','about.title','about.lead','about.f1.title','about.f1.desc','about.f2.title','about.f2.desc','about.f3.title','about.f3.desc'],
  '影像 Video': ['video.tag','video.title','video.sub','video.caption'],
  '数据 Stats': ['stats.countries','stats.clients','stats.retention','stats.years'],
  '联系 Contact': ['contact.tag','contact.title','contact.sub','contact.wechat.desc','contact.wechat.btn.copy','contact.whatsapp.desc','contact.whatsapp.btn.go','contact.line.desc','contact.line.btn.go'],
  '页脚 Footer': ['footer.nav','footer.office','footer.subscribe','footer.subscribed','footer.copy','footer.craft'],
};

function applyI18n(root = document) {
  root.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    el.innerHTML = t(key);
  });
  root.querySelectorAll('[data-i18n-ph]').forEach(el => {
    el.placeholder = t(el.getAttribute('data-i18n-ph'));
  });
  document.documentElement.lang = CURRENT_LANG === 'zh' ? 'zh-CN' : (CURRENT_LANG === 'ja' ? 'ja' : 'en');
}

function setLang(lang) {
  CURRENT_LANG = lang;
  if (typeof DB !== 'undefined') DB.setLang(lang);
  applyI18n();
  document.dispatchEvent(new CustomEvent('langchange', { detail: lang }));
}
