export type Language = 'ar' | 'en' | 'fr' | 'zh';

export const translations = {
  ar: {
    dir: 'rtl',
    brand: 'بيزنس ديفلوبرز',
    tagline: 'هندسة المؤسسات بمنظور مستقبلي',
    subtitle: 'هندسة المشاريع الناشئة بذكاء استراتيجي متكامل',
    common: { back: 'عودة' },
    nav: { home: 'الرئيسية', programs: 'البرامج', partners: 'الشركاء', contact: 'تواصل', login: 'دخول', start: 'ابدأ الرحلة' },
    hero: { title: 'هندسة المؤسسات\nبمنظور مستقبلي', sub: 'مسرعة أعمال رقمية مصممة للباحثين عن الدقة. ندمج الذكاء الاصطناعي مع الخبرة البشرية.', apply: 'تقديم الطلب', methodology: 'المنهجية' },
    stats: { startups: 'شركة محتضنة', capital: 'تمويل مستقطب', experts: 'خبير استراتيجي', countries: 'دولة مشاركة' },
    footer: { mission: 'هندسة المشاريع الناشئة بذكاء استراتيجي متكامل.', rights: 'جميع الحقوق محفوظة.' },
    dashboard: {
      home: 'الرئيسية',
      bootcamp: 'المعسكر',
      tasks: 'المهام',
      lab: 'المختبر',
      services: 'الخدمات',
      profile: 'الملف الشخصي',
      logout: 'خروج'
    },
    roles: {
      startup: 'شركة ناشئة',
      desc_startup: 'مؤسس مشروع',
      partner: 'شريك',
      desc_partner: 'خبير تشغيلي',
      mentor: 'مرشد',
      desc_mentor: 'مستشار خبير',
      admin: 'مدير',
      desc_admin: 'إدارة المنصة'
    },
    auth: {
      login_title: 'تسجيل الدخول',
      login_sub: 'بوابتك لمركز القيادة',
      email: 'البريد الإلكتروني',
      password: 'كلمة المرور',
      cta: 'دخول',
      error_admin: 'ليس لديك صلاحيات مدير',
      error_not_found: 'المستخدم غير موجود'
    }
  },
  en: {
    dir: 'ltr',
    brand: 'BIZ DEV',
    tagline: 'Engineering Enterprises for the Future',
    subtitle: 'Architecting startups with integrated strategic intelligence.',
    common: { back: 'Back' },
    nav: { home: 'Home', programs: 'Programs', partners: 'Partners', contact: 'Contact', login: 'Login', start: 'Get Started' },
    hero: { title: 'Engineering\nFuture Entities', sub: 'A digital accelerator crafted for precision. Merging AI with human strategic expertise.', apply: 'Apply Now', methodology: 'Methodology' },
    stats: { startups: 'Incubated Startups', capital: 'Raised Capital', experts: 'Strategic Experts', countries: 'Active Countries' },
    footer: { mission: 'Architecting startups with integrated strategic intelligence.', rights: 'All rights reserved.' },
    dashboard: {
      home: 'Home',
      bootcamp: 'Bootcamp',
      tasks: 'Tasks',
      lab: 'Lab',
      services: 'Services',
      profile: 'Profile',
      logout: 'Logout'
    },
    roles: {
      startup: 'Startup',
      desc_startup: 'Founder',
      partner: 'Partner',
      desc_partner: 'Ops Expert',
      mentor: 'Mentor',
      desc_mentor: 'Expert Advisor',
      admin: 'Admin',
      desc_admin: 'Platform Management'
    },
    auth: {
      login_title: 'Login',
      login_sub: 'Your gateway to the command center',
      email: 'Email',
      password: 'Password',
      cta: 'Enter',
      error_admin: 'You do not have admin privileges',
      error_not_found: 'User not found'
    }
  },
  fr: {
    dir: 'ltr',
    brand: 'BIZ DEV',
    tagline: 'L\'ingénierie des entreprises du futur',
    subtitle: 'Concevoir des startups avec une intelligence stratégique intégrée.',
    common: { back: 'Retour' },
    nav: { home: 'Accueil', programs: 'Programmes', partners: 'Partenaires', contact: 'Contact', login: 'Connexion', start: 'Commencer' },
    hero: { title: 'L\'ingénierie des\nEntités Futures', sub: 'Un accélérateur numérique conçu pour la précision. Fusionner l\'IA avec l\'expertise humaine.', apply: 'Postuler', methodology: 'Méthodologie' },
    stats: { startups: 'Startups Incubées', capital: 'Capital Levé', experts: 'Experts Stratégiques', countries: 'Pays Actifs' },
    footer: { mission: 'Concevoir des startups avec une intelligence stratégique intégrée.', rights: 'Tous droits réservés.' },
    dashboard: {
      home: 'Accueil',
      bootcamp: 'Camp d\'entraînement',
      tasks: 'Tâches',
      lab: 'Labo',
      services: 'Services',
      profile: 'Profil',
      logout: 'Déconnexion'
    },
    roles: {
      startup: 'Startup',
      desc_startup: 'Fondateur',
      partner: 'Partenaire',
      desc_partner: 'Expert Ops',
      mentor: 'Mentor',
      desc_mentor: 'Conseiller Expert',
      admin: 'Admin',
      desc_admin: 'Gestion de plateforme'
    },
    auth: {
      login_title: 'Connexion',
      login_sub: 'Votre porte d\'entrée vers le centre de commandement',
      email: 'Email',
      password: 'Mot de passe',
      cta: 'Entrer',
      error_admin: 'Vous n\'avez pas de privilèges d\'administrateur',
      error_not_found: 'Utilisateur non trouvé'
    }
  },
  zh: {
    dir: 'ltr',
    brand: '商业开发者',
    tagline: '面向未来的企业工程',
    subtitle: '以综合战略智慧构建初创企业。',
    common: { back: '返回' },
    nav: { home: '首页', programs: '计划', partners: '合作伙伴', contact: '联系我们', login: '登录', start: '开始旅程' },
    hero: { title: '工程化\n未来实体', sub: '为精准而设计的数字加速器。将人工智能与人类战略专业知识相结合。', apply: '立即申请', methodology: '方法论' },
    stats: { startups: '孵化初创企业', capital: '募集资金', experts: '战略专家', countries: '活跃国家' },
    footer: { mission: '以综合战略智慧构建初创企业。', rights: '版权所有。' },
    dashboard: {
      home: '首页',
      bootcamp: '训练营',
      tasks: '任务',
      lab: '实验室',
      services: '服务',
      profile: '个人资料',
      logout: '登出'
    },
    roles: {
      startup: '初创公司',
      desc_startup: '创始人',
      partner: '合伙人',
      desc_partner: '运营专家',
      mentor: '导师',
      desc_mentor: '专家顾问',
      admin: '管理员',
      desc_admin: '平台管理'
    },
    auth: {
      login_title: '登录',
      login_sub: '通往指挥中心的门户',
      email: '电子邮件',
      password: '密码',
      cta: '进入',
      error_admin: '您没有管理员权限',
      error_not_found: '未找到用户'
    }
  }
};

export const getTranslation = (lang: Language) => translations[lang] || translations.ar;