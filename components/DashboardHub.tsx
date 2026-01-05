
import { useState, useMemo, useEffect, Suspense } from 'react';
import { UserRole, UserProfile, LevelData, TaskRecord, TaskStatus } from '../types';
import { playPositiveSound, playCelebrationSound } from '../services/audioService';
import { storageService } from '../services/storageService';
import { LevelView } from './LevelView';
import { Logo } from './Branding/Logo';
import { Certificate } from './Certificate';
import React from 'react';

// Lazy load complex dashboard components
const KPIsCenter = React.lazy(() => import('./KPIsCenter').then(m => ({ default: m.KPIsCenter })));
const TemplateLibrary = React.lazy(() => import('./TemplateLibrary').then(m => ({ default: m.TemplateLibrary })));
const PartnerMatchingWorkflow = React.lazy(() => import('./PartnerMatchingWorkflow').then(m => ({ default: m.PartnerMatchingWorkflow })));
const ProfileManagement = React.lazy(() => import('./ProfileManagement').then(m => ({ default: m.ProfileManagement })));
const ServicesPortal = React.lazy(() => import('./ServicesPortal').then(m => ({ default: m.ServicesPortal })));
const ToolsPage = React.lazy(() => import('./ToolsPage').then(m => ({ default: m.ToolsPage })));
const DocumentsPortal = React.lazy(() => import('./DocumentsPortal').then(m => ({ default: m.DocumentsPortal })));
const SupportHub = React.lazy(() => import('./SupportHub').then(m => ({ default: m.SupportHub })));
const MentorshipPage = React.lazy(() => import('./MentorshipPage').then(m => ({ default: m.MentorshipPage })));

interface DashboardHubProps {
  user: UserProfile & { uid: string; role: UserRole; startupId?: string };
  onLogout: () => void;
  lang: any;
}

const TabLoader = () => (
  <div className="py-24 flex items-center justify-center">
    <div className="w-12 h-12 border-4 border-slate-100 border-t-primary rounded-full animate-spin"></div>
  </div>
);

export const DashboardHub: React.FC<DashboardHubProps> = ({ user, onLogout }) => {
  const [activeTab, setActiveTab] = useState<'roadmap' | 'tasks' | 'metrics' | 'templates' | 'partners' | 'profile' | 'services' | 'tools' | 'documents' | 'support' | 'mentorship'>('roadmap');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [roadmap, setRoadmap] = useState<LevelData[]>([]);
  const [tasks, setTasks] = useState<TaskRecord[]>([]);
  const [selectedLevel, setSelectedLevel] = useState<LevelData | null>(null);
  const [showCertificate, setShowCertificate] = useState(false);

  const loadAllData = () => {
    const currentRoadmap = storageService.getCurrentRoadmap(user.uid);
    setRoadmap(currentRoadmap);
    setTasks(storageService.getUserTasks(user.uid));
  };

  useEffect(() => { loadAllData(); }, [user.uid, activeTab]);

  const currentStartup = useMemo(() => {
    const startups = storageService.getAllStartups();
    return startups.find(s => s.ownerId === user.uid);
  }, [user.uid, activeTab]);

  const maturityProgress = useMemo(() => {
    if (roadmap.length === 0) return 0;
    return (roadmap.filter(l => l.isCompleted).length / roadmap.length) * 100;
  }, [roadmap]);

  const NAV_GROUPS = [
    {
      title: 'العمليات الأساسية',
      items: [
        { id: 'roadmap', label: 'خارطة الطريق', icon: '🗺️' },
        { id: 'tasks', label: 'المخرجات الرقمية', icon: '📥' },
        { id: 'profile', label: 'الملف الاستراتيجي', icon: '👤' },
      ]
    },
    {
      title: 'النمو والتمكين',
      items: [
        { id: 'mentorship', label: 'الموجه الذكي', icon: '🤖' },
        { id: 'partners', label: 'نظام المطابقة', icon: '🤝' },
        { id: 'services', label: 'دليل الخدمات', icon: '🛠️' },
        { id: 'tools', label: 'مختبر الذكاء', icon: '✨' },
      ]
    },
    {
      title: 'الحوكمة والأداء',
      items: [
        { id: 'documents', label: 'إدارة الوثائق', icon: '📄' },
        { id: 'metrics', label: 'رادار الأداء', icon: '📡' },
        { id: 'support', label: 'مركز المساندة', icon: '💬' },
      ]
    }
  ];

  if (selectedLevel) {
    return (
      <LevelView 
        level={selectedLevel} 
        user={user} 
        tasks={tasks} 
        onBack={() => setSelectedLevel(null)} 
        onComplete={() => { 
          storageService.completeLevel(user.uid, selectedLevel.id); 
          loadAllData(); 
          setSelectedLevel(null); 
          playCelebrationSound(); 
        }} 
      />
    );
  }

  const getTaskProgress = (status: TaskStatus) => {
    switch (status) {
      case 'APPROVED': return 100;
      case 'SUBMITTED': return 66;
      case 'ASSIGNED': return 33;
      case 'REJECTED': return 50;
      default: return 0;
    }
  };

  const getTaskStatusColor = (status: TaskStatus) => {
    switch (status) {
      case 'APPROVED': return 'bg-emerald-500';
      case 'SUBMITTED': return 'bg-blue-500';
      case 'REJECTED': return 'bg-rose-500';
      default: return 'bg-slate-300';
    }
  };

  return (
    <div className="min-h-screen bg-institutional-bg flex overflow-hidden text-slate-900 font-sans" dir="rtl">
      {showCertificate && <Certificate user={user} onClose={() => setShowCertificate(false)} />}

      {/* Modern Collapsible Sidebar */}
      <aside 
        className={`border-l border-slate-100 flex flex-col h-screen sticky top-0 bg-white/50 backdrop-blur-md z-50 transition-all duration-500 ease-in-out relative
        ${isSidebarCollapsed ? 'w-24' : 'w-80'}`}
      >
        {/* Toggle Button */}
        <button 
          onClick={() => { setIsSidebarCollapsed(!isSidebarCollapsed); playPositiveSound(); }}
          className="absolute -left-4 top-12 w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform z-[60]"
        >
          <svg 
            className={`w-4 h-4 transition-transform duration-500 ${isSidebarCollapsed ? '' : 'rotate-180'}`} 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor" 
            strokeWidth={3}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <div className={`p-8 mb-4 transition-all duration-500 ${isSidebarCollapsed ? 'px-4 flex justify-center' : 'px-10'}`}>
          <Logo className="h-10" hideText={isSidebarCollapsed} />
        </div>

        <nav className={`flex-1 space-y-10 overflow-y-auto pb-12 custom-scrollbar transition-all duration-500 ${isSidebarCollapsed ? 'px-3' : 'px-6'}`}>
          {NAV_GROUPS.map((group, gIdx) => (
            <div key={gIdx} className="space-y-3">
              {!isSidebarCollapsed && (
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] px-4 animate-fade-in">{group.title}</p>
              )}
              <div className="space-y-1">
                {group.items.map(item => (
                  <button
                    key={item.id}
                    onClick={() => { setActiveTab(item.id as any); playPositiveSound(); }}
                    className={`relative w-full flex items-center gap-4 transition-all duration-300 rounded-2xl group
                      ${activeTab === item.id 
                        ? 'bg-primary text-white shadow-xl shadow-primary/20 scale-[1.02]' 
                        : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100/80'}
                      ${isSidebarCollapsed ? 'justify-center p-4' : 'px-4 py-3.5'}
                    `}
                    title={isSidebarCollapsed ? item.label : ''}
                  >
                    <span className={`text-xl transition-transform duration-300 ${activeTab === item.id ? 'scale-110' : 'group-hover:scale-110'}`}>
                      {item.icon}
                    </span>
                    {!isSidebarCollapsed && (
                      <span className="text-sm font-bold truncate animate-fade-in">{item.label}</span>
                    )}
                    
                    {/* Collapsed Tooltip */}
                    {isSidebarCollapsed && (
                      <div className="absolute right-full mr-4 px-3 py-2 bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest rounded-xl opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none shadow-2xl z-50">
                        {item.label}
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </nav>

        <div className={`p-6 border-t border-slate-100 bg-white/30 transition-all duration-500 ${isSidebarCollapsed ? 'px-3' : 'p-6'}`}>
           <button 
             onClick={onLogout} 
             className={`w-full flex items-center gap-3 rounded-2xl transition-all font-black uppercase tracking-widest
               ${isSidebarCollapsed ? 'justify-center p-4' : 'justify-center py-4'}
               text-slate-400 hover:text-rose-600 hover:bg-rose-50 text-[10px]
             `}
             title={isSidebarCollapsed ? 'تسجيل الخروج' : ''}
           >
              <span>🚪</span>
              {!isSidebarCollapsed && "تسجيل الخروج"}
           </button>
        </div>
      </aside>

      {/* Main Experience Area */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="px-12 py-10 border-b border-slate-100 bg-white/80 backdrop-blur-xl flex justify-between items-center z-40">
           <div className="space-y-1">
              <div className="flex items-center gap-3">
                <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
                <span className="text-[10px] font-black text-primary uppercase tracking-[0.4em]">Accelerator Node Active</span>
              </div>
              <h2 className="text-4xl font-black text-slate-900 font-heading tracking-tight">
                {NAV_GROUPS.flatMap(g => g.items).find(i => i.id === activeTab)?.label}
              </h2>
           </div>
           
           <div className="flex items-center gap-10">
              <div className="text-left bg-slate-50 border border-slate-100 px-6 py-3 rounded-[2rem] shadow-inner hidden md:block">
                 <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Maturity Progress</p>
                 <div className="flex items-center gap-4">
                    <div className="w-40 h-2 bg-slate-200 rounded-full overflow-hidden">
                       <div className="h-full bg-primary shadow-[0_0_10px_rgba(79,70,229,0.3)] transition-all duration-1000" style={{ width: `${maturityProgress}%` }}></div>
                    </div>
                    <span className="text-sm font-black text-slate-900 tabular-nums">
                      {Math.round(maturityProgress)}%
                    </span>
                 </div>
              </div>
              
              <div className="flex items-center gap-4 border-r border-slate-100 pr-10">
                 <div className="text-right">
                    <p className="text-sm font-black text-slate-900 leading-none">{user.firstName} {user.lastName}</p>
                    <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-tighter">Founder</p>
                 </div>
                 <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center text-2xl border border-slate-200 shadow-sm">👤</div>
              </div>
           </div>
        </header>

        <div className="flex-1 overflow-y-auto p-12 custom-scrollbar bg-[radial-gradient(circle_at_top_right,rgba(79,70,229,0.02),transparent)]">
          <div className="max-w-6xl mx-auto pb-32">
            <Suspense fallback={<TabLoader />}>
              {activeTab === 'roadmap' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  {roadmap.map((level) => {
                    const isLocked = level.isLocked;
                    const isCompleted = level.isCompleted;

                    return (
                      <div 
                        key={level.id}
                        onClick={() => !isLocked && setSelectedLevel(level)}
                        className={`p-10 flex flex-col justify-between min-h-[450px] transition-all relative overflow-hidden group
                          ${isLocked 
                            ? 'opacity-50 grayscale bg-slate-50 border border-transparent cursor-not-allowed shadow-inner rounded-xl' 
                            : 'card-premium cursor-pointer'
                          }
                        `}
                      >
                        {/* Status Ornament */}
                        {!isLocked && (
                          <div className={`absolute top-0 right-0 w-40 h-40 bg-primary/5 rounded-bl-[6rem] -z-0 transition-transform duration-700 group-hover:scale-125`}></div>
                        )}

                        <div className="relative z-10 space-y-6">
                          <div className="flex justify-between items-start">
                            <div className="flex flex-col gap-3">
                              <span className="text-[11px] font-black text-slate-400 uppercase tracking-[0.4em]">المحطة 0{level.id}</span>
                              {level.complexity && (
                                <span className={`text-[9px] font-black uppercase tracking-[0.2em] px-3 py-1 rounded-full border w-fit shadow-sm flex items-center gap-1.5
                                  ${level.complexity === 'Elite' ? 'bg-rose-50 text-rose-600 border-rose-100' :
                                    level.complexity === 'High' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                                    'bg-blue-50 text-blue-600 border-blue-100'}
                                `}>
                                  <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                                  {level.complexity} INTENSITY
                                </span>
                              )}
                            </div>
                            
                            <div className={`w-16 h-16 rounded-xl flex items-center justify-center text-4xl shadow-inner border transition-all duration-700 transform group-hover:scale-110 group-hover:rotate-6
                              ${isCompleted ? 'bg-emerald-50 border-emerald-100 text-emerald-600 shadow-emerald-100' : 
                                isLocked ? 'bg-slate-100 border-slate-200 text-slate-400' : 'bg-blue-50 border-blue-100 text-blue-600 shadow-blue-50'}
                            `}>
                              {isCompleted ? '✓' : level.icon}
                            </div>
                          </div>

                          <div>
                            <h3 className="text-3xl font-black text-slate-900 mb-3 tracking-tight font-heading">{level.title}</h3>
                            <p className="text-slate-500 text-sm font-medium leading-relaxed line-clamp-2">{level.description}</p>
                          </div>

                          {/* Focus Pillars Preview */}
                          {level.pillars && level.pillars.length > 0 && !isLocked && (
                            <div className="space-y-2">
                               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Focus Pillars</p>
                               <div className="flex flex-wrap gap-2">
                                  {level.pillars.map((p, pi) => (
                                    <span key={pi} className="px-3 py-1.5 bg-slate-100/50 border border-slate-200/60 rounded-xl text-[10px] font-bold text-slate-600 flex items-center gap-2">
                                       <span className="text-xs">{p.icon}</span>
                                       {p.title}
                                    </span>
                                  ))}
                               </div>
                            </div>
                          )}

                          <div className="grid grid-cols-2 gap-6 bg-white/40 p-5 rounded-xl border border-white/60 shadow-sm backdrop-blur-sm">
                             <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-xl text-blue-600 border border-blue-100 shadow-inner">⏱️</div>
                                <div>
                                   <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Time Est.</p>
                                   <p className="text-xs font-black text-slate-700">{level.estimatedTime || 'N/A'}</p>
                                </div>
                             </div>
                             {level.resources && level.resources.length > 0 && (
                               <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-xl text-emerald-600 border border-emerald-100 shadow-inner">📚</div>
                                  <div>
                                     <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Assets</p>
                                     <div className="flex items-center gap-2">
                                        <p className="text-xs font-black text-slate-700">{level.resources.length} ملفات ذكية</p>
                                        <div className="flex -space-x-1.5 space-x-reverse">
                                           {level.resources.slice(0, 3).map((res, ri) => (
                                             <div key={ri} className="w-5 h-5 rounded-full bg-white border border-slate-200 flex items-center justify-center text-[8px] shadow-sm" title={res.title}>
                                               {res.type === 'PDF' ? '📄' : res.type === 'VIDEO' ? '🎥' : '📝'}
                                             </div>
                                           ))}
                                        </div>
                                     </div>
                                  </div>
                               </div>
                             )}
                          </div>
                        </div>
                        
                        <div className="pt-8 border-t border-slate-100 flex justify-between items-center relative z-10">
                           {!isLocked ? (
                              <div className="flex items-center gap-3 text-primary font-black text-[12px] uppercase tracking-widest group-hover:translate-x-[-6px] transition-transform">
                                 <span>{isCompleted ? 'مراجعة المخرجات' : 'بدء التنفيذ'}</span>
                                 <span className="text-xl">←</span>
                              </div>
                           ) : (
                              <div className="flex items-center gap-3 text-slate-400 font-bold text-[11px] uppercase tracking-widest">
                                 <span className="text-lg">🔒</span>
                                 <span>المحطة مغلقة</span>
                              </div>
                           )}
                           
                           {isCompleted && (
                             <div className="flex items-center gap-2 text-emerald-500 font-black text-[10px] uppercase tracking-widest bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                                Achieved
                             </div>
                           )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
              
              {activeTab === 'tasks' && (
                <div className="grid grid-cols-1 gap-10">
                  {tasks.length > 0 ? tasks.map(task => {
                    const progress = getTaskProgress(task.status);
                    const statusColor = getTaskStatusColor(task.status);
                    
                    return (
                      <div key={task.id} className="p-10 rounded-xl bg-white border border-slate-200 hover:border-primary shadow-xl shadow-slate-100/50 transition-all group relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-slate-50 rounded-bl-[4rem] group-hover:scale-110 transition-transform"></div>
                        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-12 relative z-10">
                          <div className="space-y-4 flex-1">
                            <div className="flex items-center gap-4">
                              <span className="px-4 py-1.5 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest">مخرج 0{task.levelId}</span>
                              {task.status === 'REJECTED' && (
                                <span className="px-4 py-1.5 bg-rose-50 text-rose-600 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-rose-100 animate-pulse">تحديث مطلوب</span>
                              )}
                            </div>
                            <h4 className="text-2xl font-black text-slate-900 font-heading tracking-tight">{task.title}</h4>
                            <p className="text-base text-slate-500 font-medium leading-relaxed line-clamp-1 italic max-w-2xl">"{task.description}"</p>
                          </div>

                          <div className="w-full lg:w-80 space-y-5">
                             <div className="flex justify-between items-center">
                               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">تتبع سير المخرج الاستراتيجي</p>
                               <p className="text-sm font-black text-slate-900 tabular-nums">{progress}%</p>
                             </div>
                             
                             {/* Pipeline Visualizer */}
                             <div className="relative pt-2">
                                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden shadow-inner">
                                   <div 
                                     className={`h-full transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(0,0,0,0.1)] ${statusColor}`}
                                     style={{ width: `${progress}%` }}
                                   ></div>
                                </div>
                                <div className="flex justify-between mt-4">
                                   {['تعيين', 'تسليم', 'تدقيق', 'اعتماد'].map((step, idx) => {
                                      const stepProgress = (idx + 1) * 25;
                                      const isActive = progress >= stepProgress;
                                      return (
                                        <div key={step} className="flex flex-col items-center gap-2">
                                           <div className={`w-3 h-3 rounded-full border-2 transition-all duration-500 ${isActive ? (statusColor + ' border-white shadow-md scale-125') : 'bg-white border-slate-200'}`}></div>
                                           <span className={`text-[8px] font-black uppercase tracking-tighter transition-colors ${isActive ? 'text-slate-900' : 'text-slate-300'}`}>{step}</span>
                                        </div>
                                      )
                                   })}
                                </div>
                             </div>
                          </div>

                          <button 
                            onClick={() => !selectedLevel && task.status !== 'APPROVED' && setSelectedLevel(roadmap.find(l => l.id === task.levelId) || null)}
                            className={`px-10 py-5 rounded-xl font-black text-sm transition-all shrink-0 shadow-2xl active:scale-95
                              ${task.status === 'APPROVED' 
                                ? 'bg-emerald-50 text-emerald-600 cursor-default border border-emerald-100' 
                                : 'bg-slate-900 text-white hover:bg-primary shadow-slate-900/10'}
                            `}
                          >
                            {task.status === 'SUBMITTED' ? 'قيد المراجعة...' : task.status === 'APPROVED' ? 'تم الاعتماد' : (task.status === 'REJECTED' ? 'إعادة الرفع ↺' : 'رفع المخرج')}
                          </button>
                        </div>
                      </div>
                    );
                  }) : (
                    <div className="py-48 text-center bg-slate-50 border-2 border-dashed border-slate-200 rounded-[4rem] opacity-40">
                       <span className="text-8xl mb-8 block">📥</span>
                       <h3 className="text-3xl font-black text-slate-900">بانتظار مخرجاتك الأولى</h3>
                       <p className="text-xl font-medium mt-4">ابدأ بملء "خارطة الطريق" لتظهر مخرجاتك هنا للتدقيق.</p>
                    </div>
                  )}
                </div>
              )}
              
              {activeTab === 'metrics' && currentStartup && <KPIsCenter startup={currentStartup} />}
              {activeTab === 'templates' && <TemplateLibrary userRole={user.role} isDark={false} />}
              {activeTab === 'partners' && <PartnerMatchingWorkflow user={user} isDark={false} />}
              {activeTab === 'profile' && <ProfileManagement user={user} isDark={false} />}
              {activeTab === 'services' && <ServicesPortal user={user} />}
              {activeTab === 'tools' && <ToolsPage onBack={() => setActiveTab('roadmap')} />}
              {activeTab === 'documents' && <DocumentsPortal user={user} progress={maturityProgress} onShowCertificate={() => setShowCertificate(true)} />}
              {activeTab === 'support' && <SupportHub user={user} />}
              {activeTab === 'mentorship' && <MentorshipPage user={user} onBack={() => setActiveTab('roadmap')} />}
            </Suspense>
          </div>
        </div>
      </main>
    </div>
  );
};
