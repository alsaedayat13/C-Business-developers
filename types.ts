
export type UserRole = 'STARTUP' | 'PARTNER' | 'MENTOR' | 'ADMIN';
export type ProjectTrack = 'Idea' | 'Prototype' | 'Product' | 'MVP' | 'Growth' | 'Investment Ready';
export type TaskStatus = 'LOCKED' | 'ASSIGNED' | 'SUBMITTED' | 'APPROVED' | 'REJECTED';
export type RiskLevel = 'Low' | 'Medium' | 'High' | 'Critical';

export type TicketType = 'INQUIRY' | 'COMPLAINT' | 'SUPPORT';
export type TicketStatus = 'PENDING' | 'IN_PROGRESS' | 'RESOLVED';

export type ProjectStageType = 'Idea' | 'Prototype' | 'Product';
export type TechLevelType = 'Low' | 'Medium' | 'High';

export interface ApplicantProfile {
  codeName: string;
  projectStage: ProjectStageType;
  sector: string;
  goal: string;
  techLevel: TechLevelType;
}

export interface AnalyticalQuestion {
  text: string;
  options: string[];
  correctIndex: number;
  difficulty: string;
}

export interface ProjectEvaluationResult {
  totalScore: number;
  classification: 'Green' | 'Yellow' | 'Red';
  clarity: number;
  value: number;
  innovation: number;
  market: number;
  readiness: number;
  strengths: string[];
  weaknesses: string[];
  aiOpinion: string;
}

export interface LevelPillar {
  title: string;
  description: string;
  icon: string;
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctIndex: number;
}

export interface Resource {
  title: string;
  type: 'PDF' | 'VIDEO' | 'DOC' | 'LINK';
  url: string;
}

export interface LevelData {
  id: number;
  title: string;
  description: string;
  icon: string;
  imageUrl: string;
  isLocked: boolean;
  isCompleted: boolean;
  customColor?: string;
  complexity?: 'Low' | 'Medium' | 'High' | 'Elite';
  estimatedTime?: string;
  pillars?: LevelPillar[];
  quiz?: QuizQuestion[];
  resources?: Resource[];
}

export const INITIAL_ROADMAP: LevelData[] = [
  { 
    id: 1, 
    title: 'استراتيجية التوسع العالمي', 
    description: 'تحديد الأسواق الجديدة والفرص المستقبلية باستخدام بيانات السوق المتقدمة', 
    icon: '🗺️', 
    imageUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=600', 
    isLocked: false, 
    isCompleted: false, 
    customColor: 'indigo',
    complexity: 'Medium',
    estimatedTime: '٤ ساعات',
    pillars: [
      { title: 'تحليل الفجوات', description: 'رصد المشاكل التي تجاهلها المنافسون.', icon: '🔍' },
      { title: 'بروتوكول المقابلات', description: 'تقنية استخراج الألم من العميل المستهدف.', icon: '🎙️' }
    ],
    resources: [
      { title: 'دليل التحقق من الفكرة', type: 'PDF', url: '#' },
      { title: 'فيديو: بروتوكول المقابلات', type: 'VIDEO', url: '#' }
    ]
  },
  { 
    id: 2, 
    title: 'هيكلة نموذج العمل', 
    description: 'تصميم محرك الإيرادات والقيمة لضمان استدامة الكيان المؤسسي على المدى الطويل.', 
    icon: '🏗️', 
    imageUrl: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=600', 
    isLocked: false, 
    isCompleted: false, 
    customColor: 'blue',
    complexity: 'High',
    estimatedTime: '٦ ساعات',
    pillars: [
      { title: 'مصفوفة القيمة', description: 'تأصيل السبب وراء دفع العميل للمال.', icon: '⚖️' },
      { title: 'عمارة التدفقات', description: 'رسم مسار السيولة من العميل للكيان.', icon: '💧' }
    ],
    resources: [
      { title: 'قالب BMC المطور', type: 'DOC', url: '#' },
      { title: 'أمثلة لتدفقات السيولة', type: 'PDF', url: '#' }
    ]
  },
  { 
    id: 3, 
    title: 'رادار السوق التنافسي', 
    description: 'تحليل دقيق للمنافسين وتحديد الميزة التنافسية الجوهرية لضمان التفوق.', 
    icon: '📡', 
    imageUrl: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80&w=600', 
    isLocked: false, 
    isCompleted: false, 
    customColor: 'slate',
    complexity: 'Elite',
    estimatedTime: '٨ ساعات',
    pillars: [
      { title: 'تحليل المنافسين', description: 'تحديد نقاط الضعف في حلول المنافسين.', icon: '🎯' },
      { title: 'الميزة الاستراتيجية', description: 'صياغة الـ Unfair Advantage الخاصة بك.', icon: '🧬' }
    ],
    resources: [
      { title: 'خريطة التمركز التنافسي', type: 'PDF', url: '#' },
      { title: 'تقارير قطاعية 2024', type: 'LINK', url: '#' }
    ]
  },
  { 
    id: 4, 
    title: 'بناء النواة التقنية (MVP)', 
    description: 'تطوير النسخة الأولى القابلة للاختبار الميداني والنمو السريع بأقل الموارد.', 
    icon: '🧪', 
    imageUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827?auto=format&fit=crop&q=80&w=600', 
    isLocked: false, 
    isCompleted: false, 
    customColor: 'emerald',
    complexity: 'Medium',
    estimatedTime: '٥ ساعات',
    pillars: [
      { title: 'صناعة المنتج', description: 'تحديد الخصائص الجوهرية للإطلاق.', icon: '📊' },
      { title: 'تجربة المستخدم', description: 'تصميم رحلة عميل سلسة ومنطقية.', icon: '📡' }
    ],
    resources: [
      { title: 'دليل صناعة الـ MVP', type: 'PDF', url: '#' },
      { title: 'قالب رحلة المستخدم', type: 'DOC', url: '#' }
    ]
  },
  { 
    id: 5, 
    title: 'النمذجة المالية', 
    description: 'إعداد قوائم التدفقات النقدية، تقييم المشروع، وجاهزية الجولة الاستثمارية.', 
    icon: '📊', 
    imageUrl: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&q=80&w=600', 
    isLocked: false, 
    isCompleted: false, 
    customColor: 'amber',
    complexity: 'High',
    estimatedTime: '٦ ساعات',
    pillars: [
      { title: 'توقعات التدفقات', description: 'توقع الأرباح والخسائر لـ ٣ سنوات.', icon: '📊' },
      { title: 'نقطة التعادل', description: 'متى سيبدأ المشروع في تغطية تكاليفه؟', icon: '⚖️' }
    ],
    resources: [
      { title: 'محاكي النمذجة المالية', type: 'LINK', url: '#' },
      { title: 'شرح معايير التقييم', type: 'VIDEO', url: '#' }
    ]
  },
  { 
    id: 6, 
    title: 'يوم العرض والاعتماد', 
    description: 'العرض النهائي أمام لجنة المستثمرين وقرار المسار المؤسسي النهائي للكيان.', 
    icon: '🎓', 
    imageUrl: 'https://images.unsplash.com/photo-1559136555-9303baea8ebd?auto=format&fit=crop&q=80&w=600', 
    isLocked: false, 
    isCompleted: false, 
    customColor: 'rose',
    complexity: 'Elite',
    estimatedTime: '٧ ساعات',
    pillars: [
      { title: 'العرض الاستثمارية', description: 'تصميم Pitch Deck احترافي ومقنع.', icon: '📽️' },
      { title: 'هيكلة الحصص', description: 'توزيع الملكية وتخطيط جولات التمويل.', icon: '📉' }
    ],
    resources: [
      { title: 'قالب Sequoia الرسمي', type: 'PDF', url: '#' },
      { title: 'فنون الـ Pitching', type: 'VIDEO', url: '#' }
    ]
  }
];

export enum FiltrationStage { 
  LANDING = 'LANDING', 
  WELCOME = 'WELCOME', 
  DASHBOARD = 'DASHBOARD',
  AI_MENTOR_CONCEPT = 'AI_MENTOR_CONCEPT',
  ROADMAP = 'ROADMAP',
  TOOLS = 'TOOLS',
  LOGIN = 'LOGIN',
  ACHIEVEMENTS = 'ACHIEVEMENTS',
  MENTORSHIP = 'MENTORSHIP',
  INCUBATION_PROGRAM = 'INCUBATION_PROGRAM',
  MEMBERSHIPS = 'MEMBERSHIPS',
  PARTNER_CONCEPT = 'PARTNER_CONCEPT',
  FOREIGN_INVESTMENT = 'FOREIGN_INVESTMENT',
  STAFF_PORTAL = 'STAFF_PORTAL',
  INCUBATION_APPLY = 'INCUBATION_APPLY',
  CONTACT = 'CONTACT',
  IMPACT = 'IMPACT'
}

export interface Partner { name: string; role: string; }

export interface UserProfile {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  city?: string;
  role?: UserRole;
  startupName?: string;
  startupDescription?: string;
  industry?: string;
  agreedToTerms?: boolean;
  agreedToContract?: boolean;
  founderBio?: string;
  skills?: string[];
  linkedin?: string;
  website?: string;
  partners?: Partner[];
  logo?: string;
  startupBio?: string;
  stage?: 'Idea' | 'MVP' | 'Growth' | 'InvestReady';
  name?: string;
}

export interface Badge {
  id: string;
  name: string;
  levelId: number;
  icon: string;
  description: string;
  color: string;
}

export const ACADEMY_BADGES: Badge[] = [
  { id: 'b1', name: 'وسام التحقق', levelId: 1, icon: '🛡️', description: 'تم اجتياز مرحلة التحقق الاستراتيجي', color: 'from-slate-500 to-slate-700' },
  { id: 'b2', name: 'وسام الهيكلة', levelId: 2, icon: '📐', description: 'تم بناء المنطق المؤسسي للكيان', color: 'from-indigo-500 to-purple-600' },
  { id: 'b3', name: 'وسام الرادار', levelId: 3, icon: '📡', description: 'تم تحديد الموقع التنافسي بدقة', color: 'from-blue-500 to-indigo-500' },
  { id: 'b4', name: 'وسام النواة', levelId: 4, icon: '🧪', description: 'تم بناء المنتج الأولي القابل للاختبار', color: 'from-amber-500 to-orange-500' },
  { id: 'b5', name: 'وسام الملاءة', levelId: 5, icon: '💹', description: 'الكيان محصن مالياً وجاهز للاستثمار', color: 'from-emerald-500 to-teal-600' },
  { id: 'b6', name: 'وسام النخبة', levelId: 6, icon: '🏆', description: 'المشروع جاهز للاعتماد العالمي', color: 'from-rose-500 to-pink-600' }
];

export const SECTORS = [
  { value: 'Technology', label: 'التقنية' },
  { value: 'Fintech', label: 'التقنية المالية' },
  { value: 'Health', label: 'الصحة' },
  { value: 'E-commerce', label: 'التجارة الإلكترونية' },
  { value: 'Education', label: 'التعليم' },
  { value: 'Industrial', label: 'الصناعة' }
];

export interface TaskRecord {
  id: string;
  uid: string;
  projectId: string;
  levelId: number;
  title: string;
  description: string;
  status: TaskStatus;
  submission?: {
    fileData: string;
    fileName: string;
    submittedAt: string;
  };
}

export interface StartupRecord {
  projectId: string;
  ownerId: string;
  ownerName?: string;
  name: string;
  description: string;
  industry: string;
  status: 'PENDING' | 'APPROVED' | 'STALLED' | 'GRADUATED';
  currentTrack: ProjectTrack;
  metrics: {
    readiness: number;
    tech: number;
    market: number;
  };
  kpiHistory: KPIRecord[];
  riskLevel: RiskLevel;
  aiOpinion: string;
  aiClassification?: 'Green' | 'Yellow' | 'Red';
  partners: Partner[];
  lastActivity: string;
  startupBio?: string;
  website?: string;
  linkedin?: string;
}

export interface UserRecord {
  uid: string;
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
  phone: string;
  city?: string;
  earnedBadges: string[];
  founderBio?: string;
  skills: string[];
  linkedin?: string;
  createdAt: string;
}

export interface SupportTicket {
  id: string;
  uid: string;
  projectId: string;
  type: TicketType;
  subject: string;
  message: string;
  status: TicketStatus;
  createdAt: string;
  reply?: string;
}

export interface PartnerProfile {
  uid: string;
  name: string;
  email: string;
  primaryRole: 'CTO' | 'COO' | 'CMO' | 'CPO' | 'Finance';
  experienceYears: number;
  bio: string;
  linkedin: string;
  skills: string[];
  availabilityHours: number;
  commitmentType: 'Full-time' | 'Part-time' | 'Equity-only';
  city: string;
  isRemote: boolean;
  workStyle: 'Fast' | 'Structured' | 'Balanced';
  goals: 'Exit' | 'Long-term' | 'Social Impact';
  isVerified: boolean;
  profileCompletion: number;
}

export interface PartnershipRequest {
  id: string;
  startupId: string;
  startupName: string;
  partnerUid: string;
  message: string;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED';
  createdAt: string;
}

export interface ServiceRequest {
  id: string;
  uid: string;
  projectId: string;
  serviceId: string;
  packageId: string;
  details: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
  createdAt: string;
}

export interface OpportunityAnalysis {
  newMarkets: { region: string; reasoning: string; potentialROI: string }[];
  blueOceanIdea: string;
}

export const DIGITAL_SHIELDS = ACADEMY_BADGES;

export interface ServicePackage {
  id: string;
  name: string;
  price: string;
  features: string[];
}

export interface ServiceItem {
  id: string;
  title: string;
  description: string;
  icon: string;
  packages: ServicePackage[];
}

export const SERVICES_CATALOG: ServiceItem[] = [
  {
    id: 'identity',
    title: 'تطوير الهوية المؤسسية',
    description: 'بناء هوية بصرية متكاملة تعكس قوة الكيان.',
    icon: '🎨',
    packages: [
      { id: 'id_basic', name: 'الباقة الأساسية', price: '٢٠٠٠ ر.س', features: ['شعار', 'هوية بصرية', 'قوالب عروض'] },
      { id: 'id_pro', name: 'الباقة الاحترافية', price: '٤٥٠٠ ر.س', features: ['دليل هوية كامل', 'تصميم موقع تعريفي', 'سوشيال ميديا'] }
    ]
  },
  {
    id: 'tech',
    title: 'تطوير الـ MVP التقني',
    description: 'تحويل الفكرة إلى منتج أولي قابل للاختبار.',
    icon: '💻',
    packages: [
      { id: 'mvp_base', name: 'النواة التقنية', price: '١٥٠٠٠ ر.س', features: ['برمجة MVP', 'قاعدة بيانات', 'لوحة تحكم'] },
      { id: 'mvp_scale', name: 'النمو التقني', price: '٣٥٠٠٠ ر.س', features: ['تطبيق جوال', 'ربط API', 'دعم فني سنة'] }
    ]
  }
];

export interface ProgramRating {
  stars: number;
  feedback: string;
  favoriteFeature: string;
  submittedAt: string;
}

export interface FinalResult {
  score: number;
  isQualified: boolean;
  metrics: RadarMetrics;
  leadershipStyle: string;
  projectEval: ProjectEvaluationResult;
  badges: Badge[];
}

export interface RadarMetrics {
  readiness: number;
  analysis: number;
  tech: number;
  personality: number;
  strategy: number;
  ethics: number;
}

export interface NominationData {
  companyName: string;
  founderName: string;
  location: string;
  pitchDeckUrl: string;
  hasCommercialRegister: 'YES' | 'NO' | 'IN_PROGRESS';
  hasTechnicalPartner: boolean;
  problemStatement: string;
  targetCustomerType: string[];
  marketSize: 'SMALL' | 'MEDIUM' | 'LARGE' | 'UNKNOWN';
  whyNow: string;
  productStage: 'IDEA' | 'PROTOTYPE' | 'MVP' | 'TRACTION';
  topFeatures: string;
  executionPlan: 'NONE' | 'GENERAL' | 'WEEKLY';
  userCount: string;
  revenueModel: string;
  customerAcquisitionPath: string;
  incubationReason: string;
  weeklyHours: 'LESS_5' | '5-10' | '10-20' | '20+';
  agreesToWeeklySession: boolean;
  agreesToKPIs: boolean;
  isCommitted10Hours: boolean;
  demoUrl?: string;
}

export interface NominationResult {
  totalScore: number;
  category: 'DIRECT_ADMISSION' | 'INTERVIEW' | 'PRE_INCUBATION' | 'REJECTION';
  redFlags: string[];
  aiAnalysis: string;
}

export interface ProjectBuildData {
  projectName: string;
  description: string;
  quality: 'Quick' | 'Balanced' | 'Enhanced' | 'Professional' | 'Max';
  selectedAgents: string[];
  results?: {
    vision: string;
    marketAnalysis: string;
    userPersonas: string;
    hypotheses: string[];
    pitchDeck: { title: string; content: string }[];
  };
}

export type AgentCategory = 'Vision' | 'Market' | 'User' | 'Opportunity';

export interface AIAgent {
  id: string;
  name: string;
  description: string;
  category: AgentCategory;
}

export const AVAILABLE_AGENTS: AIAgent[] = [
  { id: 'v1', name: 'وكيل الرؤية الاستراتيجية', description: 'يحلل السوق ويصيغ رؤية بعيدة المدى.', category: 'Vision' },
  { id: 'm1', name: 'محلل السوق المنافس', description: 'رصد المنافسين المباشرين وغير المباشرين.', category: 'Market' },
  { id: 'u1', name: 'مصمم شخصيات المستخدمين', description: 'بناء ملفات تعريفية للمستخدمين المستهدفين.', category: 'User' },
  { id: 'o1', name: 'مكتشف الفرص الزرقاء', description: 'تحديد فجوات السوق غير المخدومة.', category: 'Opportunity' }
];

export interface FailureSimulation {
  brutalTruth: string;
  probability: number;
  financialLoss: string;
  operationalImpact: string;
  missingQuestions: string[];
  recoveryPlan: string[];
}

export interface GovStats {
  riskyMarkets: { name: string; failRate: number }[];
  readySectors: { name: string; score: number }[];
  commonFailReasons: { reason: string; percentage: number }[];
  regulatoryGaps: string[];
}

export interface KPIRecord {
  date: string;
  growth: number;
  techReadiness: number;
  marketEngagement: number;
  revenue: number;
  burnRate: number;
}

export interface ActivityLogRecord {
  event: string;
  type: string;
  date: string;
  score: string;
  color: string;
}

export const TASKS_CONFIG = [
  { title: 'تحليل الفجوات' },
  { title: 'بروتوكول المقابلات' },
  { title: 'مصفوفة القيمة' },
  { title: 'عمارة التدفقات' },
  { title: 'تحليل المنافسين' },
  { title: 'الميزة الاستراتيجية' }
];

export interface MentorProfile {
  id: string;
  name: string;
  role: string;
  company: string;
  specialty: 'Tech' | 'Finance' | 'Growth' | 'Legal' | 'Strategy';
  bio: string;
  experience: number;
  avatar: string;
  rating: number;
  tags: string[];
}

export interface PersonalityQuestion {
  id: number;
  situation: string;
  options: { text: string; style: string }[];
}

export interface TemplateField {
  id: string;
  label: string;
  type: 'text' | 'textarea';
  placeholder: string;
  instruction: string;
}

export interface Template {
  id: string;
  title: string;
  description: string;
  icon: string;
  role: UserRole[];
  fields: TemplateField[];
  isMandatory: boolean;
  toolTipPurpose?: string;
  toolTipLogic?: string;
}

export interface TemplateSubmission {
  templateId: string;
  data: Record<string, string>;
  aiScore: number;
  aiFeedback: string;
  status: 'DRAFT' | 'SUBMITTED' | 'APPROVED' | 'REVISION_REQUIRED';
  updatedAt: string;
}

export const TEMPLATES_LIBRARY: Template[] = [
  {
    id: 'bmc',
    title: 'مخطط نموذج العمل (BMC)',
    description: 'هيكلة القيمة والعمليات والإيرادات.',
    icon: '📊',
    role: ['STARTUP'],
    isMandatory: true,
    toolTipPurpose: 'توضيح منطق تحقيق الربح والقيمة.',
    toolTipLogic: 'فحص الترابط بين شرائح العملاء والقيمة المقترحة.',
    fields: [
      { id: 'value_prop', label: 'القيمة المقترحة', type: 'textarea', placeholder: 'ما المشكلة التي تحلها؟', instruction: 'ركز على الألم الذي تعالجه.' },
      { id: 'revenue', label: 'مصادر الإيرادات', type: 'text', placeholder: 'كيف ستحقق المال؟', instruction: 'اذكر النماذج السعرية.' }
    ]
  }
];

export interface MatchResult {
  id: string;
  partnerUid: string;
  name: string;
  role: string;
  totalScore: number;
  reason: string;
  scores: { 
    roleFit: number; 
    experienceFit: number; 
    industryFit: number; 
    styleFit: number; 
  };
}
