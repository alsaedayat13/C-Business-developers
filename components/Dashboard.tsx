
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { LevelData, UserProfile, DIGITAL_SHIELDS, SECTORS, TaskRecord, SERVICES_CATALOG, ServiceItem, ServicePackage, ServiceRequest, OpportunityAnalysis, ProgramRating, Partner, TaskStatus } from '../types';
import { storageService } from '../services/storageService';
import { discoverOpportunities, suggestIconsForLevels } from '../services/geminiService';
import { Language, getTranslation } from '../services/i18nService';
import { LanguageSwitcher } from './LanguageSwitcher';
import { playPositiveSound, playCelebrationSound } from '../services/audioService';
import { ProgramEvaluation } from './ProgramEvaluation';

interface DashboardProps {
  user: UserProfile;
  levels: LevelData[];
  onSelectLevel: (id: number) => void;
  onShowCertificate: () => void;
  onLogout?: () => void;
  onOpenProAnalytics?: () => void;
  onUpdateLevelUI?: (id: number, icon: string, color: string) => void;
  onAISuggestIcons?: () => Promise<void>;
  lang: Language;
  onLanguageChange: (lang: Language) => void;
}

const PRESET_COLORS = [
  { name: 'blue', bg: 'bg-blue-600', text: 'text-blue-600', border: 'border-blue-600', light: 'bg-blue-50', ring: 'ring-blue-500' },
  { name: 'emerald', bg: 'bg-emerald-600', text: 'text-emerald-600', border: 'border-emerald-600', light: 'bg-emerald-50', ring: 'ring-emerald-500' },
  { name: 'rose', bg: 'bg-rose-600', text: 'text-rose-600', border: 'border-rose-600', light: 'bg-rose-50', ring: 'ring-rose-500' },
  { name: 'indigo', bg: 'bg-indigo-600', text: 'text-indigo-600', border: 'border-indigo-600', light: 'bg-indigo-50', ring: 'ring-indigo-500' },
  { name: 'orange', bg: 'bg-orange-500', text: 'text-orange-500', border: 'border-orange-500', light: 'bg-orange-50', ring: 'ring-orange-500' },
  { name: 'amber', bg: 'bg-amber-500', text: 'text-amber-500', border: 'border-amber-500', light: 'bg-amber-50', ring: 'ring-amber-500' },
  { name: 'pink', bg: 'bg-pink-600', text: 'text-pink-600', border: 'border-pink-600', light: 'bg-pink-50', ring: 'ring-pink-500' },
  { name: 'slate', bg: 'bg-slate-500', text: 'text-slate-500', border: 'border-slate-500', light: 'bg-slate-50', ring: 'ring-slate-500' },
];

export const Dashboard: React.FC<DashboardProps> = ({ 
  user: initialUser, levels: initialLevels, onSelectLevel, onShowCertificate, onLogout, 
  onOpenProAnalytics, onUpdateLevelUI, onAISuggestIcons,
  lang, onLanguageChange
}) => {
  const [activeNav, setActiveNav] = useState('home');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [themeMode, setThemeMode] = useState<'light' | 'dark'>(() => (localStorage.getItem('dashboard_theme_mode') as any) || 'light');
  const [isAISuggesting, setIsAISuggesting] = useState(false);
  const [localLevels, setLocalLevels] = useState<LevelData[]>(initialLevels);
  
  const t = getTranslation(lang);
  
  const NAV_ITEMS = [
    { id: 'home', label: t.dashboard.home, icon: '🏠' },
    { id: 'bootcamp', label: t.dashboard.bootcamp, icon: '📚' },
    { id: 'tasks', label: t.dashboard.tasks, icon: '📝' },
    { id: 'opportunity_lab', label: t.dashboard.lab, icon: '🧭' },
    { id: 'services', label: t.dashboard.services, icon: '🛠️' }, 
    { id: 'startup_profile', label: t.dashboard.profile, icon: '📈' },
  ];

  const [userProfile, setUserProfile] = useState<UserProfile>(initialUser);
  const [userTasks, setUserTasks] = useState<TaskRecord[]>([]);
  const [userRequests, setUserRequests] = useState<ServiceRequest[]>([]);
  const [selectedTask, setSelectedTask] = useState<TaskRecord | null>(null);
  const [submissionFile, setSubmissionFile] = useState<{data: string, name: string} | null>(null);
  
  const [selectedService, setSelectedService] = useState<ServiceItem | null>(null);
  const [selectedPackageId, setSelectedPackageId] = useState<string | null>(null);
  const [serviceDetails, setServiceDetails] = useState('');

  const [isSaving, setIsSaving] = useState(false);
  const [isAnalyzingOpp, setIsAnalyzingOpp] = useState(false);
  const [oppResult, setOppResult] = useState<OpportunityAnalysis | null>(null);
  
  // Custom Task State
  const [showAddTaskModal, setShowAddTaskModal] = useState(false);
  const [customTaskTitle, setCustomTaskTitle] = useState('');
  const [customTaskDesc, setCustomTaskDesc] = useState('');
  
  const [showRatingModal, setShowRatingModal] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const taskFileRef = useRef<HTMLInputElement>(null);

  // Profile Specific State
  const [newPartner, setNewPartner] = useState<Partner>({ name: '', role: '' });

  const completedCount = localLevels.filter(l => l.isCompleted).length;
  const progress = (completedCount / localLevels.length) * 100;
  const isDark = themeMode === 'dark';

  useEffect(() => {
    if (isDark) document.body.classList.add('dark');
    else document.body.classList.remove('dark');
  }, [isDark]);

  useEffect(() => {
    const session = storageService.getCurrentSession();
    if (session) {
      const tasks = storageService.getUserTasks(session.uid);
      setUserTasks(tasks);
      const requests = storageService.getUserServiceRequests(session.uid);
      setUserRequests(requests);

      const startups = storageService.getAllStartups();
      const currentStartup = startups.find(s => s.projectId === session.projectId);
      const usersList = storageService.getAllUsers();
      const currentUserRecord = usersList.find(u => u.uid === session.uid);

      if (currentStartup && currentUserRecord) {
        setUserProfile(prev => ({
          ...prev,
          firstName: currentUserRecord.firstName,
          lastName: currentUserRecord.lastName,
          email: currentUserRecord.email,
          phone: currentUserRecord.phone,
          founderBio: currentUserRecord.founderBio || '',
          startupName: currentStartup.name,
          startupDescription: currentStartup.description,
          startupBio: currentStartup.startupBio || '',
          industry: currentStartup.industry,
          website: currentStartup.website || '',
          linkedin: currentStartup.linkedin || '',
          partners: currentStartup.partners || [],
          logo: localStorage.getItem(`logo_${session.uid}`) || undefined
        }));
      }
    }
  }, [activeNav, localLevels]);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setUserProfile(prev => ({ ...prev, logo: base64 }));
        const session = storageService.getCurrentSession();
        if (session) localStorage.setItem(`logo_${session.uid}`, base64);
        playPositiveSound();
      };
      reader.readAsDataURL(file);
    }
  };

  const handleTaskSubmit = () => {
    if (!selectedTask || !submissionFile) return;
    const session = storageService.getCurrentSession();
    storageService.submitTask(session.uid, selectedTask.id, {
      fileData: submissionFile.data,
      fileName: submissionFile.name
    });
    setUserTasks(prev => prev.map(t => t.id === selectedTask.id ? { ...t, status: 'SUBMITTED' } : t));
    setSelectedTask(null);
    setSubmissionFile(null);
    playCelebrationSound();
  };

  const handleAddCustomTask = () => {
    if (!customTaskTitle.trim()) return;
    const session = storageService.getCurrentSession();
    if (session) {
      const newTask = storageService.createCustomTask(session.uid, session.projectId, customTaskTitle, customTaskDesc);
      setUserTasks(prev => [...prev, newTask]);
      setCustomTaskTitle('');
      setCustomTaskDesc('');
      setShowAddTaskModal(false);
      playCelebrationSound();
    }
  };

  const handleSaveProfile = () => {
    setIsSaving(true);
    const session = storageService.getCurrentSession();
    if (session) {
      storageService.updateUser(session.uid, {
        firstName: userProfile.firstName,
        lastName: userProfile.lastName,
        email: userProfile.email,
        phone: userProfile.phone,
        founderBio: userProfile.founderBio
      });
      storageService.updateStartup(session.projectId, {
        name: userProfile.startupName,
        description: userProfile.startupDescription,
        startupBio: userProfile.startupBio,
        industry: userProfile.industry,
        website: userProfile.website,
        linkedin: userProfile.linkedin,
        partners: userProfile.partners
      });
    }
    setTimeout(() => {
      setIsSaving(false);
      playCelebrationSound();
    }, 1000);
  };

  const addPartner = () => {
    if (!newPartner.name.trim() || !newPartner.role.trim()) return;
    setUserProfile(prev => ({
      ...prev,
      partners: [...(prev.partners || []), newPartner]
    }));
    setNewPartner({ name: '', role: '' });
    playPositiveSound();
  };

  const removePartner = (index: number) => {
    setUserProfile(prev => ({
      ...prev,
      partners: prev.partners?.filter((_, i) => i !== index)
    }));
  };

  const handleServiceRequestSubmit = () => {
    if (!selectedService || !selectedPackageId) return;
    const session = storageService.getCurrentSession();
    if (session) {
      storageService.requestService(session.uid, selectedService.id, selectedPackageId, serviceDetails);
      const requests = storageService.getUserServiceRequests(session.uid);
      setUserRequests(requests);
      setSelectedService(null);
      setSelectedPackageId(null);
      setServiceDetails('');
      playCelebrationSound();
      alert('تم إرسال طلب الخدمة بنجاح!');
    }
  };

  const handleRunOppAnalysis = async () => {
    setIsAnalyzingOpp(true);
    try {
      const result = await discoverOpportunities(userProfile.startupName, userProfile.startupDescription, userProfile.industry);
      setOppResult(result);
      playCelebrationSound();
    } catch (e) { alert("Failed."); } finally { setIsAnalyzingOpp(false); }
  };

  const handleAISuggest = async () => {
    setIsAISuggesting(true);
    playPositiveSound();
    try {
      // Logic: Ask Gemini to recommend elite icons and matching theme names from our palette
      const response = await suggestIconsForLevels();
      if (response && response.suggestions) {
        const updatedLevels = localLevels.map(lvl => {
          const suggestion = response.suggestions.find((s: any) => s.id === lvl.id);
          if (suggestion) {
            // Map the suggested color to one of our theme names
            return { ...lvl, icon: suggestion.icon, customColor: suggestion.color.toLowerCase() };
          }
          return lvl;
        });
        setLocalLevels(updatedLevels);
        const session = storageService.getCurrentSession();
        if (session) {
           localStorage.setItem(`bd_roadmap_${session.uid}`, JSON.stringify(updatedLevels));
        }
        playCelebrationSound();
      }
    } catch (e) { 
      console.error("AI Suggestion failed", e);
      alert('فشل توليد الاقتراحات الذكية.'); 
    } finally { 
      setIsAISuggesting(false); 
    }
  };

  const getLevelColorSet = (colorName?: string) => {
    const normalizedColor = (colorName || 'blue').toLowerCase();
    return PRESET_COLORS.find(c => c.name === normalizedColor) || PRESET_COLORS[0];
  };

  const getTaskForLevel = (levelId: number) => {
    return userTasks.find(t => t.levelId === levelId);
  };

  const getTaskProgressPercent = (status: TaskStatus) => {
    switch (status) {
      case 'LOCKED': return 0;
      case 'ASSIGNED': return 25;
      case 'SUBMITTED': return 75;
      case 'APPROVED': return 100;
      case 'REJECTED': return 50;
      default: return 0;
    }
  };

  const getStatusBadge = (task?: TaskRecord) => {
    if (!task) return null;
    switch (task.status) {
      case 'SUBMITTED': return <span className="text-[9px] font-black bg-amber-100 text-amber-600 px-2 py-0.5 rounded-md border border-amber-200">قيد المراجعة</span>;
      case 'APPROVED': return <span className="text-[9px] font-black bg-emerald-100 text-emerald-600 px-2 py-0.5 rounded-md border border-emerald-200">مكتمل ✓</span>;
      case 'ASSIGNED': return <span className="text-[9px] font-black bg-blue-100 text-blue-600 px-2 py-0.5 rounded-md border border-blue-200">بانتظار التسليم</span>;
      case 'REJECTED': return <span className="text-[9px] font-black bg-rose-100 text-rose-600 px-2 py-0.5 rounded-md border border-rose-200">مرفوض !</span>;
      default: return null;
    }
  };

  const getComplexityBadge = (complexity?: string) => {
    switch(complexity) {
      case 'Elite': return <span className="bg-slate-900 text-white px-2 py-0.5 rounded-lg text-[8px] font-black uppercase tracking-widest border border-white/20">Elite Challenge</span>;
      case 'High': return <span className="bg-rose-500/10 text-rose-500 px-2 py-0.5 rounded-lg text-[8px] font-black uppercase tracking-widest border border-rose-500/20">High Complexity</span>;
      case 'Medium': return <span className="bg-blue-500/10 text-blue-500 px-2 py-0.5 rounded-lg text-[8px] font-black uppercase tracking-widest border border-blue-500/20">Strategic Mid</span>;
      default: return null;
    }
  };

  return (
    <div className={`min-h-screen flex ${isDark ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'} font-sans transition-colors duration-500`} dir={t.dir}>
      <style>{`
        .sidebar-neo { backdrop-filter: blur(40px); background: ${isDark ? 'rgba(15, 23, 42, 0.4)' : 'rgba(255, 255, 255, 0.7)'}; border-left: 1px solid ${isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'}; }
        .dashboard-header { backdrop-filter: blur(20px); background: ${isDark ? 'rgba(2, 6, 23, 0.6)' : 'rgba(248, 250, 252, 0.6)'}; border-bottom: 1px solid ${isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'}; }
        .active-nav { background: #4F46E5; color: white; box-shadow: 0 12px 30px -10px rgba(79, 70, 229, 0.5); transform: ${t.dir === 'rtl' ? 'translateX(-6px)' : 'translateX(6px)'}; }
        .card-neo { transition: all 0.6s cubic-bezier(0.22, 1, 0.36, 1); border: 1px solid ${isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.04)'}; background: ${isDark ? 'rgba(30, 41, 59, 0.25)' : 'rgba(255, 255, 255, 0.9)'}; }
        .card-neo:hover { transform: translateY(-4px); box-shadow: 0 20px 40px -10px rgba(0,0,0,0.05); }
        .input-profile { width: 100%; padding: 1rem; border-radius: 1rem; border: 1px solid ${isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'}; background: ${isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)'}; outline: none; transition: all 0.3s; font-weight: bold; }
        .input-profile:focus { border-color: #4F46E5; box-shadow: 0 0 0 4px rgba(79, 70, 229, 0.1); background: ${isDark ? 'rgba(255,255,255,0.05)' : 'white'}; }
        .progress-glow { box-shadow: 0 0 10px rgba(79, 70, 229, 0.4); }
        .task-pipeline-step { position: relative; flex: 1; text-align: center; }
        .task-pipeline-step::after { content: ''; position: absolute; top: 12px; right: 50%; width: 100%; height: 2px; background: #e2e8f0; z-index: 0; }
        .task-pipeline-step:first-child::after { display: none; }
        .task-pipeline-dot { width: 24px; height: 24px; border-radius: 50%; border: 2px solid #e2e8f0; background: white; margin: 0 auto 8px; position: relative; z-index: 10; display: flex; items-center: center; justify-content: center; font-size: 10px; font-weight: 800; transition: all 0.4s; }
        .task-pipeline-active .task-pipeline-dot { border-color: #4F46E5; color: #4F46E5; box-shadow: 0 0 10px rgba(79, 70, 229, 0.2); }
        .task-pipeline-completed .task-pipeline-dot { background: #4F46E5; border-color: #4F46E5; color: white; }
        .task-pipeline-completed::after { background: #4F46E5; }
      `}</style>

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 ${t.dir === 'rtl' ? 'right-0' : 'left-0'} z-50 w-72 lg:static transition-transform duration-700 ${isMobileMenuOpen ? 'translate-x-0' : (t.dir === 'rtl' ? 'translate-x-full lg:translate-x-0' : '-translate-x-full lg:translate-x-0')} sidebar-neo flex flex-col m-4 rounded-[3rem] shadow-premium`}>
        <div className="p-10 text-center space-y-6">
          <div className="relative inline-block group">
            <div className="absolute inset-0 bg-primary rounded-[2.5rem] blur-[30px] opacity-10 group-hover:opacity-40 transition-opacity"></div>
            <div className="w-24 h-24 mx-auto relative bg-gradient-to-br from-primary to-indigo-600 rounded-[2.2rem] flex items-center justify-center shadow-2xl overflow-hidden border-2 border-white/20 transform group-hover:rotate-12 transition-transform duration-500">
              {userProfile.logo ? <img src={userProfile.logo} className="w-full h-full object-cover" alt="logo" /> : <span className="text-white text-4xl font-black">BD</span>}
            </div>
          </div>
          <div>
            <h2 className={`font-black text-xl truncate tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>{userProfile.startupName}</h2>
            <div className="inline-flex items-center gap-2 mt-1 px-3 py-1 bg-emerald-500/10 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <p className="text-[9px] font-black text-emerald-500 uppercase tracking-widest">Growth Phase</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-4 space-y-2 overflow-y-auto pt-6">
          {NAV_ITEMS.map(item => (
            <button 
              key={item.id} 
              onClick={() => { setActiveNav(item.id); setIsMobileMenuOpen(false); playPositiveSound(); }} 
              className={`w-full flex items-center justify-between p-4 rounded-[1.8rem] font-bold text-sm transition-all duration-300 group ${activeNav === item.id ? 'active-nav' : `text-slate-400 hover:bg-primary/5 hover:text-primary`}`}
            >
              <div className="flex items-center gap-4">
                <span className={`text-2xl transition-all duration-300 group-hover:scale-125 ${activeNav === item.id ? '' : 'grayscale opacity-50'}`}>{item.icon}</span>
                <span>{item.label}</span>
              </div>
              {activeNav === item.id && <div className="w-1.5 h-1.5 bg-white/60 rounded-full"></div>}
            </button>
          ))}
        </nav>

        <div className="p-6 space-y-4">
          <LanguageSwitcher currentLang={lang} onLanguageChange={onLanguageChange} variant="minimal" />
          <button onClick={() => { const n = isDark ? 'light' : 'dark'; setThemeMode(n); localStorage.setItem('dashboard_theme_mode', n); }} className={`w-full p-4 rounded-2xl border transition-all duration-300 ${isDark ? 'border-slate-800 bg-slate-900/50 text-slate-400 hover:text-amber-400' : 'border-slate-200 bg-white text-slate-600 hover:text-primary hover:border-primary'} text-[10px] font-black uppercase tracking-widest`}>
             {isDark ? '☀️ Switch Theme' : '🌙 Switch Theme'}
          </button>
          <button onClick={onLogout} className="w-full p-4 text-rose-500 font-black text-[10px] uppercase tracking-widest hover:bg-rose-500/5 rounded-2xl transition-colors">{t.dashboard.logout}</button>
        </div>
      </aside>

      {/* Main Experience Area */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="h-24 dashboard-header flex items-center justify-between px-10 z-40">
           <div className="flex items-center gap-6">
              <button onClick={() => setIsMobileMenuOpen(true)} className="lg:hidden p-3 glass rounded-2xl text-primary">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M4 6h16M4 12h16m-7 6h7" /></svg>
              </button>
              <div>
                <h2 className={`text-3xl font-black tracking-tight leading-none ${isDark ? 'text-white' : 'text-slate-900'}`}>{NAV_ITEMS.find(i => i.id === activeNav)?.label}</h2>
                <p className="text-[10px] font-black text-primary uppercase tracking-widest mt-2 opacity-80">AI Accelerator v2.8</p>
              </div>
           </div>
           <div className="flex items-center gap-4">
              {activeNav === 'startup_profile' && (
                <button onClick={handleSaveProfile} disabled={isSaving} className="bg-primary text-white px-10 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-primary/30 active:scale-95 transition-all hover:bg-indigo-700">
                  {isSaving ? 'جاري الحفظ...' : 'حفظ التعديلات'}
                </button>
              )}
              {activeNav === 'home' && (
                 <>
                   <button onClick={handleAISuggest} disabled={isAISuggesting} className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl active:scale-95 transition-all flex items-center gap-3 disabled:opacity-50">
                    {isAISuggesting ? <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : '✨'}
                    <span>تحديث الأيقونات (AI)</span>
                  </button>
                  <button onClick={onOpenProAnalytics} className="bg-primary text-white px-10 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl active:scale-95 transition-all hover:bg-indigo-700">تحليلات PRO</button>
                 </>
              )}
              {activeNav === 'tasks' && (
                <button onClick={() => { setShowAddTaskModal(true); playPositiveSound(); }} className="bg-emerald-600 text-white px-10 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-emerald-600/30 active:scale-95 transition-all hover:bg-emerald-700">
                  إضافة مهمة مخصصة +
                </button>
              )}
           </div>
        </header>

        <div className="flex-1 overflow-y-auto p-10 relative">
           {activeNav === 'home' && (
             <div className="max-w-6xl mx-auto space-y-12 animate-fade-in-up pb-20">
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                   <div className="p-10 bg-gradient-to-br from-primary to-indigo-700 rounded-[3.5rem] text-white premium-shadow relative overflow-hidden group">
                      <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-[80px] group-hover:scale-150 transition-transform duration-1000"></div>
                      <p className="text-[11px] font-black uppercase opacity-60 mb-2 tracking-[0.2em]">إنجاز المسار التدريبي</p>
                      <h3 className="text-6xl font-black tracking-tighter">{Math.round(progress)}%</h3>
                      <div className="mt-10 bg-white/20 h-2.5 rounded-full overflow-hidden shadow-inner">
                        <div className="bg-white h-full transition-all duration-1000 ease-out" style={{ width: `${progress}%` }}></div>
                      </div>
                   </div>
                   <div className={`p-10 rounded-[3.5rem] card-neo flex flex-col justify-between`}>
                      <div className="flex justify-between items-start">
                        <p className={`text-[11px] font-black uppercase tracking-widest ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>الأوسمة المحققة</p>
                        <span className="text-3xl">🛡️</span>
                      </div>
                      <h3 className={`text-6xl font-black mt-4 ${isDark ? 'text-white' : 'text-slate-800'}`}>{completedCount}</h3>
                   </div>
                   <div className={`p-10 rounded-[3.5rem] card-neo flex flex-col justify-between`}>
                      <div className="flex justify-between items-start">
                        <p className={`text-[11px] font-black uppercase tracking-widest ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>المهام المكتملة</p>
                        <span className="text-3xl">📝</span>
                      </div>
                      <h3 className={`text-6xl font-black mt-4 ${isDark ? 'text-white' : 'text-slate-800'}`}>{userTasks.filter(t => t.status === 'SUBMITTED' || t.status === 'APPROVED').length}</h3>
                   </div>
                </div>

                {/* Roadmap List refinement */}
                <div className="space-y-8">
                   <div className="flex justify-between items-center px-4">
                      <h3 className={`text-2xl font-black tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>مسار التسريع الرقمي</h3>
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">{completedCount} / {localLevels.length} المحطات المكتملة</span>
                   </div>
                   <div className={`rounded-[3.5rem] card-neo overflow-hidden`}>
                      <div className={`divide-y ${isDark ? 'divide-white/5' : 'divide-slate-100'}`}>
                        {localLevels.map((level) => {
                          const colorSet = getLevelColorSet(level.customColor);
                          const levelTask = getTaskForLevel(level.id);
                          return (
                            <div 
                              key={level.id} 
                              onClick={() => !level.isLocked && onSelectLevel(level.id)} 
                              className={`p-10 flex flex-col md:flex-row items-center justify-between transition-all duration-300 ${level.isLocked ? 'opacity-40 grayscale cursor-not-allowed' : 'cursor-pointer hover:bg-primary/[0.03]'} group`}
                            >
                               <div className="flex items-center gap-10 flex-1 min-w-0">
                                  {/* Visual ID / Icon Area */}
                                  <div className="relative shrink-0">
                                     <div className={`w-24 h-24 rounded-[2.5rem] flex items-center justify-center text-5xl shrink-0 transition-all premium-shadow ${level.isCompleted ? (colorSet.bg) + ' text-white shadow-lg' : (level.isLocked ? (isDark ? 'bg-slate-800 text-slate-600' : 'bg-slate-100 text-slate-300') : colorSet.light + ' ' + colorSet.text)} group-hover:scale-110 group-hover:rotate-3`}>
                                        {level.isCompleted ? '✓' : level.icon}
                                     </div>
                                     <div className="absolute -top-2 -right-2 w-8 h-8 bg-white dark:bg-slate-900 border border-slate-100 dark:border-white/10 rounded-full flex items-center justify-center text-[10px] font-black text-slate-400 shadow-sm">
                                       0{level.id}
                                     </div>
                                  </div>

                                  <div className="flex-1 space-y-4">
                                    <div className="flex flex-wrap items-center gap-3">
                                      {getComplexityBadge(level.complexity)}
                                      {level.estimatedTime && (
                                        <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-100 dark:bg-white/5 rounded-lg border border-slate-200 dark:border-white/10">
                                          <span className="text-[10px]">⏱️</span>
                                          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{level.estimatedTime}</span>
                                        </div>
                                      )}
                                      {getStatusBadge(levelTask)}
                                    </div>
                                    
                                    <div>
                                      <h4 className={`font-black text-3xl transition-colors ${!level.isLocked ? 'group-hover:' + colorSet.text : ''}`}>
                                        {level.title}
                                      </h4>
                                      <p className="text-slate-500 text-sm mt-1 font-medium max-w-xl line-clamp-2">{level.description}</p>
                                    </div>
                                    
                                    <div className="flex flex-wrap gap-6 pt-2">
                                      <div className="flex items-center gap-2">
                                        <span className="text-[10px] text-slate-400 uppercase font-black tracking-widest">Pillars</span>
                                        <div className="flex gap-1">
                                          {(level.pillars || []).slice(0, 3).map((_, i) => (
                                            <div key={i} className={`w-1.5 h-1.5 rounded-full ${!level.isLocked ? colorSet.bg : 'bg-slate-300'}`}></div>
                                          ))}
                                        </div>
                                      </div>
                                      
                                      <div className="flex items-center gap-2">
                                        <span className="text-[10px] text-slate-400 uppercase font-black tracking-widest">Documentation</span>
                                        <div className="flex items-center gap-2">
                                           <span className={`text-[10px] font-black ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>{level.resources?.length || 0} Assets</span>
                                           {level.resources && level.resources.length > 0 && (
                                             <div className="flex -space-x-2 space-x-reverse">
                                                {level.resources.slice(0, 3).map((res, i) => (
                                                   <div key={i} className="w-5 h-5 rounded-md bg-white border border-slate-200 flex items-center justify-center text-[8px] shadow-sm" title={res.title}>
                                                      {res.type === 'PDF' ? '📄' : res.type === 'VIDEO' ? '🎥' : '📝'}
                                                   </div>
                                                ))}
                                             </div>
                                           )}
                                        </div>
                                      </div>
                                    </div>

                                    {/* Detailed Visual Progress Indicator */}
                                    <div className="max-w-md pt-2">
                                      <div className="flex justify-between items-center mb-2">
                                         <span className={`text-[9px] font-black uppercase tracking-[0.2em] ${level.isCompleted ? 'text-emerald-500' : 'text-slate-400'}`}>
                                            {level.isCompleted ? 'Maturity Level Achieved' : (level.isLocked ? 'Encryption Locked' : 'Acceleration Active')}
                                         </span>
                                         <span className={`text-[10px] font-black ${level.isCompleted ? 'text-emerald-500' : colorSet.text}`}>
                                           {level.isCompleted ? '100%' : (level.isLocked ? '0%' : '20%')}
                                         </span>
                                      </div>
                                      <div className="h-1.5 w-full bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden shadow-inner">
                                        <div 
                                          className={`h-full transition-all duration-1000 ease-out progress-glow ${level.isCompleted ? 'bg-emerald-50 shadow-[0_0_10px_rgba(16,185,129,0.3)]' : colorSet.bg}`} 
                                          style={{ width: level.isCompleted ? '100%' : (level.isLocked ? '0%' : '20%') }}
                                        ></div>
                                      </div>
                                    </div>
                                  </div>
                               </div>

                               <div className="flex flex-col items-end gap-3 shrink-0 mt-8 md:mt-0 px-6">
                                  {level.isLocked ? (
                                    <div className={`flex items-center gap-3 px-8 py-5 rounded-[2rem] border ${isDark ? 'bg-slate-900 border-white/5 text-slate-600' : 'bg-slate-50 border-slate-200 text-slate-400'}`}>
                                        <span className="text-xl">🔒</span>
                                        <span className="text-[11px] font-black uppercase tracking-widest">Locked Stage</span>
                                    </div>
                                  ) : (
                                    <button 
                                      onClick={(e) => { e.stopPropagation(); onSelectLevel(level.id); }}
                                      className={`flex items-center gap-6 px-12 py-6 rounded-[2.2rem] border transition-all duration-500 shadow-2xl ${level.isCompleted ? 'bg-emerald-500 text-white border-emerald-500 shadow-emerald-500/20' : colorSet.bg + ' text-white border-transparent shadow-primary/30 hover:brightness-110 hover:-translate-y-1'}`}>
                                        <div className="text-right">
                                           <p className="text-[11px] font-black uppercase tracking-widest opacity-70">{level.isCompleted ? 'Review Output' : 'Initialize Session'}</p>
                                           <p className="text-sm font-black">{level.isCompleted ? 'عرض المخرجات' : 'بدء التنفيذ'}</p>
                                        </div>
                                        <span className="text-4xl leading-none transition-transform group-hover:translate-x-[-6px]">{level.isCompleted ? '✓' : '→'}</span>
                                    </button>
                                  )}
                               </div>
                            </div>
                          );
                        })}
                      </div>
                   </div>
                </div>
             </div>
           )}

           {activeNav === 'tasks' && (
             <div className="max-w-5xl mx-auto space-y-12 animate-fade-in-up pb-20">
                <div className="flex justify-between items-end border-b border-slate-100 dark:border-white/5 pb-8">
                  <div>
                    <h3 className={`text-4xl font-black tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>مركز المخرجات والمهام</h3>
                    <p className="text-slate-500 font-medium mt-1">أدر مهامك الاستراتيجية والتشغيلية في مكان واحد بتتبع ذكي للمراحل.</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                   {userTasks.map(task => {
                     const isApproved = task.status === 'APPROVED';
                     const isSubmitted = task.status === 'SUBMITTED';
                     const isRejected = task.status === 'REJECTED';
                     const isAssigned = task.status === 'ASSIGNED';

                     return (
                       <div key={task.id} className="p-10 rounded-[3.5rem] card-neo relative overflow-hidden flex flex-col justify-between group">
                          <div className={`absolute top-0 right-0 w-32 h-32 opacity-5 rounded-bl-[4rem] transition-all group-hover:scale-110 ${task.levelId > 0 ? 'bg-primary' : 'bg-emerald-600'}`}></div>
                          
                          <div>
                            <div className="flex justify-between items-center mb-8">
                               <span className={`text-[10px] font-black uppercase tracking-[0.2em] ${task.levelId > 0 ? 'text-primary' : 'text-emerald-500'}`}>
                                 {task.levelId > 0 ? `Strategic Milestone 0${task.levelId}` : 'Custom Project Task'}
                               </span>
                               {getStatusBadge(task)}
                            </div>
                            <h4 className="text-2xl font-black mb-4 leading-tight">{task.title}</h4>
                            <p className="text-sm text-slate-500 mb-8 leading-relaxed font-medium min-h-[60px] line-clamp-3">{task.description}</p>
                            
                            {/* Pipeline Progress Indicator */}
                            <div className="flex justify-between items-start mb-10">
                               <div className={`task-pipeline-step ${isAssigned || isSubmitted || isApproved || isRejected ? 'task-pipeline-active' : ''} ${isSubmitted || isApproved ? 'task-pipeline-completed' : ''}`}>
                                  <div className="task-pipeline-dot">1</div>
                                  <span className="text-[8px] font-bold text-slate-400 uppercase block">تعيين</span>
                               </div>
                               <div className={`task-pipeline-step ${isSubmitted || isApproved || isRejected ? 'task-pipeline-active' : ''} ${isApproved ? 'task-pipeline-completed' : ''}`}>
                                  <div className="task-pipeline-dot">2</div>
                                  <span className="text-[8px] font-bold text-slate-400 uppercase block">تسليم</span>
                               </div>
                               <div className={`task-pipeline-step ${isSubmitted || isApproved || isRejected ? 'task-pipeline-active' : ''} ${isApproved ? 'task-pipeline-completed' : ''}`}>
                                  <div className="task-pipeline-dot">3</div>
                                  <span className="text-[8px] font-bold text-slate-400 uppercase block">تدقيق</span>
                               </div>
                               <div className={`task-pipeline-step ${isApproved ? 'task-pipeline-active task-pipeline-completed' : ''}`}>
                                  <div className="task-pipeline-dot">4</div>
                                  <span className="text-[8px] font-bold text-slate-400 uppercase block">اعتماد</span>
                               </div>
                            </div>
                          </div>

                          <div className="pt-6 border-t border-slate-50 dark:border-white/5">
                            {(isAssigned || isRejected) && (
                               <button onClick={() => setSelectedTask(task)} className={`w-full py-5 text-white rounded-2xl font-black text-sm hover:brightness-110 transition-all shadow-xl active:scale-95 ${isRejected ? 'bg-rose-500' : (task.levelId > 0 ? 'bg-gradient-to-r from-primary to-indigo-600 shadow-primary/20' : 'bg-gradient-to-r from-emerald-600 to-teal-600 shadow-emerald-600/20')}`}>
                                 {isRejected ? 'إعادة تسليم المخرج ↺' : 'تسليم المخرج (PDF)'}
                               </button>
                            )}
                            {isSubmitted && (
                               <div className="p-4 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-100 dark:border-white/10 text-center">
                                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">المرفق: {task.submission?.fileName}</p>
                                  <p className="text-[10px] text-amber-500 font-bold mt-1">جاري التدقيق الاستراتيجي الرقمي</p>
                               </div>
                            )}
                            {isApproved && (
                              <div className="p-4 bg-emerald-50 dark:bg-emerald-500/5 rounded-2xl border border-emerald-100 dark:border-emerald-500/20 text-center flex items-center justify-center gap-3">
                                 <span className="text-xl">✅</span>
                                 <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-black uppercase">تم الاعتماد والمطابقة بنجاح</p>
                              </div>
                            )}
                          </div>
                       </div>
                     );
                   })}
                </div>
             </div>
           )}

           {activeNav === 'opportunity_lab' && (
             <div className="max-w-6xl mx-auto space-y-14 animate-fade-in-up pb-20">
                <div className="text-center space-y-6">
                   <div className="inline-flex items-center gap-3 bg-blue-50 text-primary px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.3em] border border-blue-100 mx-auto">
                      AI Deep Analysis Engine
                   </div>
                   <h3 className="text-5xl font-black tracking-tight text-slate-900 dark:text-white">مختبر الفرص والنمو</h3>
                   <p className="text-slate-500 max-w-2xl mx-auto font-medium text-lg">استخدم وكلاء Gemini المتطورين لاكتشاف أسواق جديدة غير مخدومة لمشروعك.</p>
                </div>
                {!oppResult && (
                  <div className="flex flex-col items-center py-24 space-y-10">
                     <div className="w-24 h-24 bg-slate-100 dark:bg-slate-800 rounded-[2.5rem] flex items-center justify-center text-5xl animate-bounce">🧭</div>
                     <button onClick={handleRunOppAnalysis} disabled={isAnalyzingOpp} className="px-16 py-6 bg-slate-900 text-white rounded-[2.2rem] font-black text-xl shadow-2xl hover:bg-primary transition-all active:scale-95 flex items-center gap-5">
                        {isAnalyzingOpp ? (
                          <>
                            <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
                            <span>جاري المسح الاستراتيجي...</span>
                          </>
                        ) : 'تفعيل محرك المسح الاستراتيجي'}
                     </button>
                  </div>
                )}
                {oppResult && (
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 animate-fade-in-up">
                    <div className="lg:col-span-2 space-y-8">
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                          {oppResult.newMarkets.map((m, i) => (
                            <div key={i} className={`p-10 rounded-[3.5rem] card-neo relative overflow-hidden`}>
                               <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-bl-[4rem]"></div>
                               <h5 className="text-2xl font-black text-primary mb-6">{m.region}</h5>
                               <p className="text-base text-slate-600 dark:text-slate-400 font-medium leading-relaxed">{m.reasoning}</p>
                               <div className="mt-8 flex items-center gap-4">
                                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">ROI Potential:</span>
                                  <span className="text-sm font-black text-emerald-500">{m.potentialROI}</span>
                               </div>
                            </div>
                          ))}
                       </div>
                    </div>
                    <div className="space-y-8">
                       <div className="p-12 bg-gradient-to-br from-indigo-600 to-primary text-white rounded-[4rem] premium-shadow relative overflow-hidden group">
                          <div className="absolute top-[-20px] left-[-20px] text-9xl opacity-10 group-hover:rotate-12 transition-transform duration-700">💭</div>
                          <h4 className="text-xl font-black mb-8 relative z-10 flex items-center gap-4">
                             <span className="w-1.5 h-6 bg-white/40 rounded-full"></span>
                             استراتيجية المحيط الأزرق
                          </h4>
                          <p className="italic font-medium text-xl leading-relaxed opacity-95 relative z-10">"{oppResult.blueOceanIdea}"</p>
                       </div>
                    </div>
                  </div>
                )}
             </div>
           )}

           {activeNav === 'services' && (
             <div className="max-w-6xl mx-auto space-y-14 animate-fade-in pb-20">
                <div className="text-center space-y-4">
                   <h3 className="text-5xl font-black tracking-tight">خدمات التنفيذ المتميزة</h3>
                   <p className="text-slate-500 text-lg font-medium">فريق متخصص لنمذجة مخرجاتك الريادية بجودة استثمارية عالمية.</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                   {SERVICES_CATALOG.map(svc => (
                     <div key={svc.id} className={`p-12 rounded-[3.5rem] card-neo flex flex-col justify-between`}>
                        <div>
                          <div className="w-20 h-20 bg-slate-50 dark:bg-slate-800 rounded-[2rem] flex items-center justify-center text-5xl mb-8 shadow-inner">{svc.icon}</div>
                          <h4 className="text-2xl font-black mb-4 leading-tight">{svc.title}</h4>
                          <p className="text-sm text-slate-500 mb-10 leading-relaxed font-medium line-clamp-3">{svc.description}</p>
                        </div>
                        <button onClick={() => { setSelectedService(svc); playPositiveSound(); }} className="w-full py-5 bg-slate-900 text-white rounded-2xl font-black text-sm hover:bg-primary transition-all active:scale-95 shadow-lg">اكتشف الباقات المتاحة</button>
                     </div>
                   ))}
                </div>
             </div>
           )}

           {activeNav === 'startup_profile' && (
             <div className="max-w-5xl mx-auto space-y-10 animate-fade-in-up pb-20">
                {/* Founder Info Card */}
                <div className="p-10 rounded-[3rem] card-neo space-y-10 relative overflow-hidden">
                   <div className="flex items-center gap-4 mb-6">
                      <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center text-white text-2xl shadow-lg">👤</div>
                      <h3 className="text-2xl font-black">بيانات المؤسس</h3>
                   </div>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pr-2">الاسم الأول</label>
                        <input className="input-profile" value={userProfile.firstName} onChange={e => setUserProfile({...userProfile, firstName: e.target.value})} />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pr-2">اللقب</label>
                        <input className="input-profile" value={userProfile.lastName} onChange={e => setUserProfile({...userProfile, lastName: e.target.value})} />
                      </div>
                      <div className="space-y-2 md:col-span-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pr-2">النبذة الشخصية (Bio)</label>
                        <textarea className="input-profile h-32 resize-none leading-relaxed" placeholder="تحدث عن خبراتك ومهاراتك الريادية..." value={userProfile.founderBio} onChange={e => setUserProfile({...userProfile, founderBio: e.target.value})} />
                      </div>
                   </div>
                </div>

                {/* Company Info Card */}
                <div className="p-10 rounded-[3rem] card-neo space-y-10">
                   <div className="flex flex-col md:flex-row gap-12">
                      <div className="w-full md:w-1/3 flex flex-col items-center gap-6">
                        <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                           <div className="w-48 h-48 rounded-[3.5rem] border-4 border-dashed border-slate-200 dark:border-slate-800 flex items-center justify-center bg-slate-50 dark:bg-slate-900/50 overflow-hidden shadow-inner group-hover:border-primary transition-colors">
                              {userProfile.logo ? <img src={userProfile.logo} className="w-full h-full object-cover" alt="logo" /> : <span className="text-6xl opacity-30">📁</span>}
                           </div>
                           <div className="absolute inset-0 flex items-center justify-center bg-black/40 text-white opacity-0 group-hover:opacity-100 rounded-[3.5rem] transition-opacity font-black text-[10px] uppercase tracking-widest">رفع الشعار</div>
                           <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleLogoUpload} />
                        </div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">شعار المشروع الرسمي</p>
                      </div>

                      <div className="flex-1 space-y-8">
                         <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div className="space-y-2">
                               <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pr-2">اسم المشروع</label>
                               <input className="input-profile" value={userProfile.startupName} onChange={e => setUserProfile({...userProfile, startupName: e.target.value})} />
                            </div>
                            <div className="space-y-2">
                               <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pr-2">القطاع</label>
                               <select className="input-profile" value={userProfile.industry} onChange={e => setUserProfile({...userProfile, industry: e.target.value})}>
                                  {SECTORS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                               </select>
                            </div>
                            <div className="space-y-2">
                               <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pr-2">الموقع الإلكتروني</label>
                               <input className="input-profile font-mono text-sm" placeholder="https://..." value={userProfile.website} onChange={e => setUserProfile({...userProfile, website: e.target.value})} />
                            </div>
                            <div className="space-y-2">
                               <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pr-2">LinkedIn الشركة</label>
                               <input className="input-profile font-mono text-sm" placeholder="https://linkedin.com/company/..." value={userProfile.linkedin} onChange={e => setUserProfile({...userProfile, linkedin: e.target.value})} />
                            </div>
                         </div>
                         <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pr-2">نبذة عن الشركة (Mission)</label>
                            <textarea className="input-profile h-40 resize-none leading-relaxed" placeholder="ما هي رؤيتكم والهدف الجوهري للمشروع؟" value={userProfile.startupBio} onChange={e => setUserProfile({...userProfile, startupBio: e.target.value})} />
                         </div>
                      </div>
                   </div>
                </div>

                {/* Team / Partners Card */}
                <div className="p-10 rounded-[3rem] card-neo space-y-8">
                   <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-emerald-600 rounded-2xl flex items-center justify-center text-white text-2xl shadow-lg">👥</div>
                      <h3 className="text-2xl font-black">الشركاء المؤسسين (Team)</h3>
                   </div>
                   
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-6">
                        <div className="p-6 bg-slate-50 dark:bg-white/5 rounded-[2rem] border border-slate-100 dark:border-white/5 space-y-4">
                           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">إضافة شريك جديد</p>
                           <div className="space-y-3">
                              <input className="input-profile bg-white dark:bg-slate-900 shadow-sm" placeholder="اسم الشريك" value={newPartner.name} onChange={e => setNewPartner({...newPartner, name: e.target.value})} />
                              <input className="input-profile bg-white dark:bg-slate-900 shadow-sm" placeholder="الدور (مثال: شريك تقني)" value={newPartner.role} onChange={e => setNewPartner({...newPartner, role: e.target.value})} />
                              <button onClick={addPartner} className="w-full py-4 bg-emerald-600 text-white rounded-xl font-black text-xs hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-600/20 active:scale-95">إضافة الشريك للقائمة</button>
                           </div>
                        </div>
                      </div>

                      <div className="space-y-4">
                         {userProfile.partners && userProfile.partners.length > 0 ? (
                            <div className="grid grid-cols-1 gap-3">
                               {userProfile.partners.map((p, i) => (
                                 <div key={i} className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-white/5 flex justify-between items-center group animate-fade-in">
                                    <div className="flex items-center gap-4">
                                       <div className="w-10 h-10 rounded-full bg-blue-50 text-primary flex items-center justify-center font-black">{p.name.charAt(0)}</div>
                                       <div>
                                          <p className="font-black text-sm">{p.name}</p>
                                          <p className="text-[10px] text-slate-500 font-bold uppercase">{p.role}</p>
                                       </div>
                                    </div>
                                    <button onClick={() => removePartner(i)} className="text-slate-300 hover:text-rose-500 transition-colors opacity-0 group-hover:opacity-100 p-2">✕</button>
                                 </div>
                               ))}
                            </div>
                         ) : (
                            <div className="h-full flex flex-col items-center justify-center p-12 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-[2rem] text-center opacity-30">
                               <p className="text-5xl mb-4">🤝</p>
                               <p className="font-bold text-sm">لا يوجد شركاء مسجلين حتى الآن</p>
                            </div>
                         )}
                      </div>
                   </div>
                </div>

                <div className="flex justify-center pt-10">
                   <button onClick={handleSaveProfile} disabled={isSaving} className="px-20 py-7 bg-primary text-white rounded-[2.5rem] font-black text-2xl shadow-3xl shadow-primary/30 hover:bg-indigo-700 transition-all transform hover:scale-105 active:scale-95 disabled:opacity-50">
                      {isSaving ? 'جاري مزامنة البيانات...' : 'حفظ الملف التعريفي 🚀'}
                   </button>
                </div>
             </div>
           )}
        </div>

        {/* Task Submission Modal */}
        {selectedTask && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xl animate-fade-in" dir="rtl">
            <div className={`max-w-2xl w-full p-12 rounded-[4rem] ${isDark ? 'bg-slate-900 border border-white/5 text-white' : 'bg-white shadow-2xl text-slate-900'} animate-fade-in-up`}>
              <div className="flex justify-between items-start mb-10">
                 <div>
                    <h3 className="text-3xl font-black tracking-tight">تسليم: {selectedTask.title}</h3>
                    <p className="text-blue-50 text-[10px] font-black uppercase tracking-widest mt-1">Deliverable Submission Portal (PDF Only)</p>
                 </div>
                 <button onClick={() => { setSelectedTask(null); setSubmissionFile(null); }} className="p-2 hover:bg-slate-100 dark:hover:bg-white/5 rounded-xl transition-colors">✕</button>
              </div>
              <div className="bg-slate-50 dark:bg-white/5 p-6 rounded-[2rem] border border-slate-100 dark:border-white/10 mb-8">
                <p className="text-slate-500 text-sm leading-relaxed font-medium">{selectedTask.description}</p>
              </div>
              
              <div onClick={() => taskFileRef.current?.click()} className={`w-full h-72 border-4 border-dashed rounded-[3rem] flex flex-col items-center justify-center cursor-pointer transition-all duration-300 ${submissionFile ? 'bg-emerald-500/5 border-emerald-500' : (isDark ? 'bg-slate-800 border-white/5 hover:border-primary/50' : 'bg-slate-50 border-slate-200 hover:border-primary/50')}`}>
                 <input type="file" ref={taskFileRef} className="hidden" accept="application/pdf" onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file && file.type === 'application/pdf') {
                      const reader = new FileReader();
                      reader.onloadend = () => {
                        setSubmissionFile({ data: reader.result as string, name: file.name });
                        playPositiveSound();
                      };
                      reader.readAsDataURL(file);
                    }
                 }} />
                 {submissionFile ? (
                   <>
                      <span className="text-5xl mb-4">📄</span>
                      <p className="font-black text-emerald-500 text-lg">{submissionFile.name}</p>
                      <p className="text-xs text-slate-400 mt-2">انقر لتغيير الملف</p>
                   </>
                 ) : (
                   <>
                      <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center text-white text-3xl shadow-lg mb-6 transform group-hover:scale-110 transition-transform">📁</div>
                      <p className="font-black text-slate-400">انقر هنا لرفع مخرجك النهائي بصيغة PDF</p>
                      <p className="text-[10px] text-slate-500 mt-2 font-bold uppercase tracking-widest">Maximum Size: 5MB</p>
                   </>
                 )}
              </div>

              <div className="flex gap-4 mt-10">
                <button onClick={() => { setSelectedTask(null); setSubmissionFile(null); }} className="flex-1 py-5 font-black text-slate-400 hover:text-slate-600 transition-colors">إغلاق</button>
                <button onClick={handleTaskSubmit} disabled={!submissionFile} className="flex-[2] py-5 bg-primary text-white rounded-[2rem] font-black text-lg shadow-xl shadow-primary/30 disabled:opacity-30 active:scale-95 transition-all hover:bg-indigo-700">إرسال المخرج للمراجعة 🚀</button>
              </div>
            </div>
          </div>
        )}

        {/* Add Custom Task Modal */}
        {showAddTaskModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xl animate-fade-in" dir="rtl">
            <div className={`max-w-xl w-full p-12 rounded-[4rem] ${isDark ? 'bg-slate-900 border border-white/5 text-white' : 'bg-white shadow-2xl text-slate-900'} animate-fade-in-up`}>
               <h3 className="text-3xl font-black mb-8">إضافة مهمة مخصصة</h3>
               <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pr-2">عنوان المهمة</label>
                    <input className="input-profile" value={customTaskTitle} onChange={e => setCustomTaskTitle(e.target.value)} placeholder="مثال: مراجعة العقد مع المورد..." />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pr-2">الوصف (اختياري)</label>
                    <textarea className="input-profile h-32 resize-none" value={customTaskDesc} onChange={e => setCustomTaskDesc(e.target.value)} placeholder="تفاصيل إضافية للمهمة..." />
                  </div>
               </div>
               <div className="flex gap-4 mt-10">
                  <button onClick={() => setShowAddTaskModal(false)} className="flex-1 py-5 font-black text-slate-400 hover:text-slate-600 transition-colors">إلغاء</button>
                  <button onClick={handleAddCustomTask} className="flex-[2] py-5 bg-emerald-600 text-white rounded-[2rem] font-black text-lg shadow-xl shadow-emerald-600/30 active:scale-95 transition-all hover:bg-emerald-700">حفظ المهمة</button>
               </div>
            </div>
          </div>
        )}

        {showRatingModal && <ProgramEvaluation onClose={() => setShowRatingModal(false)} onSubmit={() => {}} />}
      </main>
    </div>
  );
};
