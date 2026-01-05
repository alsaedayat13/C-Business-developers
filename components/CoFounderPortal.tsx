
import React, { useState, useEffect } from 'react';
import { PartnerProfile, StartupRecord, UserRole, UserProfile, PartnershipRequest, UserRecord } from '../types';
import { storageService } from '../services/storageService';
import { playPositiveSound, playCelebrationSound, playErrorSound } from '../services/audioService';

interface CoFounderPortalProps {
  user: UserProfile & { uid: string; role: UserRole; startupId?: string };
  onBack: () => void;
}

interface NavItemProps {
  id: string;
  label: string;
  icon: string;
  badge?: number;
  isActive: boolean;
  isCollapsed: boolean;
  onClick: (id: any) => void;
}

const NavItem: React.FC<NavItemProps> = ({ id, label, icon, badge, isActive, isCollapsed, onClick }) => {
  return (
    <button
      onClick={() => onClick(id)}
      className={`relative w-full flex items-center transition-all duration-300 group rounded-2xl
        ${isActive 
          ? 'bg-emerald-600 text-white shadow-xl shadow-emerald-600/20' 
          : 'text-slate-400 hover:bg-slate-50 hover:text-emerald-600'}
        ${isCollapsed ? 'justify-center p-4' : 'px-5 py-4 gap-4'}
      `}
    >
      <div className="flex items-center gap-4">
        <span className={`text-xl transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-125'}`}>
          {icon}
        </span>
        {!isCollapsed && (
          <span className="text-sm font-bold truncate animate-fade-in">{label}</span>
        )}
      </div>
      
      {badge ? (
        <span className={`absolute ${isCollapsed ? '-top-1 -right-1' : 'left-3'} bg-rose-500 text-white text-[9px] min-w-[18px] h-[18px] flex items-center justify-center rounded-full font-black border-2 border-white shadow-sm`}>
          {badge}
        </span>
      ) : null}

      {isCollapsed && (
        <div className="absolute right-full mr-4 px-3 py-2 bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest rounded-xl opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none shadow-2xl z-50">
          {label}
        </div>
      )}

      {isActive && !isCollapsed && (
        <div className="absolute left-3 w-1 h-5 bg-white/40 rounded-full"></div>
      )}
    </button>
  );
};

export const CoFounderPortal: React.FC<CoFounderPortalProps> = ({ user, onBack }) => {
  const [activeTab, setActiveTab] = useState<'browse' | 'requests' | 'algorithm' | 'profile'>('browse');
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [incomingRequests, setIncomingRequests] = useState<PartnershipRequest[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<{ req: PartnershipRequest; startup: StartupRecord; owner: UserRecord } | null>(null);
  
  const [partnerForm, setPartnerForm] = useState<Partial<PartnerProfile>>({
    primaryRole: 'CTO',
    experienceYears: 5,
    availabilityHours: 20,
    commitmentType: 'Part-time',
    city: 'الرياض',
    isRemote: true,
    workStyle: 'Fast',
    goals: 'Long-term',
    bio: '',
    linkedin: ''
  });

  useEffect(() => {
    const loadData = () => {
      const allPartners = storageService.getAllPartners();
      const currentPartner = allPartners.find(p => p.uid === user.uid);
      if (currentPartner) {
        setPartnerForm(currentPartner);
      }

      const requests = storageService.getPartnerRequests(user.uid);
      setIncomingRequests(requests.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
    };
    loadData();
  }, [user.uid, activeTab]);

  const handleViewRequestDetails = (req: PartnershipRequest) => {
    const startups = storageService.getAllStartups();
    const startup = startups.find(s => s.projectId === req.startupId);
    const users = storageService.getAllUsers();
    const owner = users.find(u => u.uid === startup?.ownerId);

    if (startup && owner) {
      setSelectedRequest({ req, startup, owner });
      playPositiveSound();
    } else {
      alert("تعذر العثور على بيانات الشركة حالياً.");
    }
  };

  const handleRequestAction = (reqId: string, status: 'ACCEPTED' | 'REJECTED') => {
    storageService.updatePartnershipStatus(reqId, status);
    setIncomingRequests(prev => prev.map(r => r.id === reqId ? { ...r, status } : r));
    
    if (selectedRequest && selectedRequest.req.id === reqId) {
      setSelectedRequest({ ...selectedRequest, req: { ...selectedRequest.req, status } });
    }

    playPositiveSound();
    if (status === 'ACCEPTED') playCelebrationSound();
  };

  const navItems = [
    { id: 'browse', label: 'استكشاف المشاريع', icon: '🌍' },
    { id: 'algorithm', label: 'نظام المطابقة', icon: '🧠' },
    { id: 'requests', label: 'طلبات الشراكة', icon: '📩', badge: incomingRequests.filter(r => r.status === 'PENDING').length },
    { id: 'profile', label: 'الملف الشخصي', icon: '👤' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex transition-all duration-500 overflow-hidden" dir="rtl">
      
      {/* Collapsible Sidebar */}
      <aside 
        className={`bg-white border-l border-slate-200 flex flex-col shadow-2xl sticky top-0 h-screen z-50 transition-all duration-500 ease-in-out 
        ${isCollapsed ? 'w-24' : 'w-80'} 
        ${isMobileMenuOpen ? 'translate-x-0 fixed inset-y-0 right-0' : 'translate-x-full lg:translate-x-0 lg:static'}`}
      >
        {/* Toggle Button */}
        <button 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className={`absolute -left-4 top-10 w-8 h-8 bg-emerald-600 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-emerald-700 transition-all transform z-[60] ${isCollapsed ? 'rotate-180' : ''}`}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        {/* Branding & Status */}
        <div className={`p-6 border-b border-slate-100 flex flex-col items-center transition-all ${isCollapsed ? 'px-2' : 'px-6'}`}>
          <div className={`flex items-center gap-3 mb-6 w-full ${isCollapsed ? 'justify-center' : 'justify-start'}`}>
            <div className="w-12 h-12 bg-emerald-600 rounded-2xl flex items-center justify-center text-white font-black shadow-xl shrink-0 transition-transform hover:rotate-6">
              CF
            </div>
            {!isCollapsed && (
              <div className="animate-fade-in overflow-hidden">
                <h1 className="text-sm font-black text-slate-900 tracking-tight uppercase whitespace-nowrap">لوحة الشريك</h1>
                <p className="text-[8px] font-black text-emerald-500 tracking-widest uppercase">Ecosystem Partner</p>
              </div>
            )}
          </div>

          {!isCollapsed ? (
            <div className="w-full p-5 bg-slate-900 rounded-[2rem] text-white shadow-2xl relative overflow-hidden group animate-fade-in">
              <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-600/10 rounded-full blur-[40px]"></div>
              <p className="text-[9px] font-black text-emerald-400 uppercase tracking-widest mb-1">الحالة المهنية</p>
              <div className="flex items-center gap-2 mb-3">
                 <span className="text-3xl font-black">نشط</span>
                 <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse mb-1"></div>
              </div>
              <div className="w-full bg-white/10 h-1 rounded-full overflow-hidden">
                <div className="bg-emerald-500 h-full w-full transition-all duration-1000 ease-out"></div>
              </div>
            </div>
          ) : (
            <div className="w-10 h-10 rounded-full bg-slate-900 flex items-center justify-center relative group cursor-help shadow-lg border border-emerald-500/20">
               <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto custom-scrollbar overflow-x-hidden">
          {navItems.map(item => (
            <NavItem
              key={item.id}
              id={item.id}
              label={item.label}
              icon={item.icon}
              badge={item.badge}
              isActive={activeTab === item.id}
              isCollapsed={isCollapsed}
              onClick={(id) => { setActiveTab(id); playPositiveSound(); if(isMobileMenuOpen) setIsMobileMenuOpen(false); }}
            />
          ))}
        </nav>

        {/* Footer Sidebar */}
        <div className={`p-4 border-t border-slate-100 space-y-2 bg-white ${isCollapsed ? 'items-center' : ''}`}>
           <button 
             onClick={onBack} 
             className={`w-full flex items-center transition-all duration-300 rounded-2xl group
               ${isCollapsed ? 'justify-center p-4' : 'px-5 py-4 gap-4'}
               text-rose-500 hover:bg-rose-50
             `}
           >
              <span className="text-xl group-hover:scale-125 transition-transform">🚪</span>
              {!isCollapsed && <span className="text-sm font-black uppercase tracking-widest">خروج</span>}
           </button>
        </div>
      </aside>

      {/* Main Experience Area */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Header */}
        <header className="px-10 py-8 bg-white/50 backdrop-blur-md border-b border-slate-200 shrink-0">
          <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
             <div className="flex items-center gap-4 lg:hidden">
                <button onClick={() => setIsMobileMenuOpen(true)} className="p-3 bg-white rounded-2xl shadow-sm text-emerald-600 border border-emerald-50 hover:bg-emerald-50 transition-colors">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16m-7 6h7" />
                  </svg>
                </button>
             </div>
             <div className="animate-fade-in">
                <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight leading-none mb-2">
                  {navItems.find(n => n.id === activeTab)?.label}
                </h2>
                <p className="text-slate-500 font-medium text-lg leading-relaxed max-w-2xl">
                  {activeTab === 'requests' ? 'راجع تفاصيل الشركات الناشئة الراغبة في التعاون معك.' : 
                   activeTab === 'algorithm' ? 'خوارزمية Gemini الذكية لربطك بالمشاريع المكملة لمهاراتك.' :
                   activeTab === 'browse' ? 'استكشف الفرص المتاحة في مجتمع بيزنس ديفلوبرز.' :
                   'إدارة ملفك الشخصي كشريك مؤسس استراتيجي.'}
                </p>
             </div>
          </div>
        </header>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-10 custom-scrollbar pb-32">
          <div className="max-w-6xl mx-auto">
            {activeTab === 'browse' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-fade-up">
                 {storageService.getAllStartups().slice(0, 6).map((startup, i) => (
                    <div key={i} className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm flex flex-col justify-between hover:border-emerald-200 transition-all card-premium">
                       <div>
                          <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-3xl mb-8 shadow-inner group-hover:scale-110 transition-transform">🚀</div>
                          <h4 className="text-2xl font-black text-slate-900 mb-2">{startup.name}</h4>
                          <span className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-[10px] font-black uppercase tracking-widest">{startup.industry}</span>
                          <p className="text-sm text-slate-500 mt-6 leading-relaxed font-medium line-clamp-3">{startup.description}</p>
                       </div>
                       <div className="mt-8 pt-6 border-t border-slate-50 flex items-center justify-between">
                          <div className="flex gap-2">
                             <div className="text-center">
                                <p className="text-xs font-black text-slate-900">{startup.metrics.readiness}%</p>
                                <p className="text-[8px] text-slate-400 uppercase font-black">الجاهزية</p>
                             </div>
                          </div>
                          <button className="px-6 py-3 bg-slate-900 text-white rounded-xl font-black text-[10px] hover:bg-emerald-600 transition-all">التفاصيل</button>
                       </div>
                    </div>
                 ))}
              </div>
            )}

            {activeTab === 'requests' && (
               <div className="space-y-6 animate-fade-up">
                  {incomingRequests.length > 0 ? incomingRequests.map(req => (
                    <div key={req.id} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col lg:flex-row justify-between items-center gap-8 hover:border-emerald-200 transition-all">
                       <div className="flex items-center gap-6 flex-1">
                          <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-3xl shadow-inner border border-slate-50 shrink-0">🏢</div>
                          <div>
                             <div className="flex items-center gap-4 mb-1">
                               <h4 className="text-xl font-black text-slate-900">{req.startupName}</h4>
                               <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase border
                                 ${req.status === 'ACCEPTED' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : req.status === 'REJECTED' ? 'bg-rose-50 text-rose-600 border-rose-100' : 'bg-amber-50 text-amber-600 border-amber-100'}
                               `}>
                                 {req.status === 'ACCEPTED' ? 'مقبول' : req.status === 'REJECTED' ? 'مرفوض' : 'طلب جديد'}
                               </span>
                             </div>
                             <p className="text-sm text-slate-500 font-medium truncate max-w-md italic">"{req.message}"</p>
                          </div>
                       </div>

                       <div className="flex items-center gap-4 shrink-0">
                          <button 
                            onClick={() => handleViewRequestDetails(req)}
                            className="px-8 py-4 bg-slate-100 text-slate-600 hover:bg-slate-200 rounded-2xl font-black text-xs transition-all"
                          >
                             مراجعة الملف التعريفي
                          </button>
                          {req.status === 'PENDING' && (
                            <div className="flex gap-2">
                               <button onClick={(e) => { e.stopPropagation(); handleRequestAction(req.id, 'REJECTED'); }} className="p-4 bg-rose-50 text-rose-500 hover:bg-rose-100 rounded-2xl transition-all"><svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path d="M6 18L18 6M6 6l12 12" /></svg></button>
                               <button onClick={(e) => { e.stopPropagation(); handleRequestAction(req.id, 'ACCEPTED'); }} className="p-4 bg-emerald-600 text-white hover:bg-emerald-700 rounded-2xl transition-all shadow-lg shadow-emerald-500/20"><svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path d="M5 13l4 4L19 7" /></svg></button>
                            </div>
                          )}
                       </div>
                    </div>
                  )) : (
                    <div className="py-32 text-center bg-white rounded-[4rem] border-2 border-dashed border-slate-100 opacity-40">
                       <div className="text-7xl mb-6">📩</div>
                       <h3 className="text-2xl font-black text-slate-900">لا توجد طلبات شراكة</h3>
                    </div>
                  )}
               </div>
            )}

            {activeTab === 'algorithm' && (
               <div className="py-20 text-center space-y-8 animate-fade-in">
                  <div className="w-32 h-32 bg-emerald-50 rounded-full flex items-center justify-center mx-auto shadow-inner text-6xl">🧠</div>
                  <h3 className="text-3xl font-black text-slate-900">محرك المطابقة الذكي</h3>
                  <p className="text-slate-500 max-w-md mx-auto font-medium">يقوم النظام بتحليل خبراتك وربطها بالمشاريع الأكثر احتياجاً لمهاراتك في مرحلة الاحتضان الحالية.</p>
                  <button className="px-12 py-5 bg-emerald-600 text-white rounded-2xl font-black text-lg shadow-xl shadow-emerald-500/20 active:scale-95 transition-all">تفعيل رادار المشاريع</button>
               </div>
            )}

            {activeTab === 'profile' && (
               <div className="max-w-3xl mx-auto bg-white p-12 rounded-[3.5rem] border border-slate-100 shadow-2xl animate-fade-up">
                  <div className="text-center mb-12">
                     <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center text-4xl mx-auto shadow-inner mb-4">👤</div>
                     <h3 className="text-2xl font-black text-slate-900">ملف الشريك المؤسس</h3>
                  </div>
                  <div className="space-y-8">
                     <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                           <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pr-2">الدور الرئيسي</label>
                           <div className="p-4 bg-slate-50 rounded-xl font-bold text-slate-800 border border-slate-100">{partnerForm.primaryRole}</div>
                        </div>
                        <div className="space-y-2">
                           <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pr-2">سنوات الخبرة</label>
                           <div className="p-4 bg-slate-50 rounded-xl font-bold text-slate-800 border border-slate-100">{partnerForm.experienceYears} سنة</div>
                        </div>
                     </div>
                     <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pr-2">النبذة المهنية</label>
                        <div className="p-6 bg-slate-50 rounded-2xl font-medium text-slate-600 leading-relaxed border border-slate-100">{partnerForm.bio || 'لا توجد نبذة حالياً.'}</div>
                     </div>
                     <button className="w-full py-5 bg-slate-900 text-white rounded-2xl font-black hover:bg-emerald-600 transition-colors active:scale-95">تعديل البيانات المهنية</button>
                  </div>
               </div>
            )}
          </div>
        </div>
      </main>

      {/* Startup Detailed Modal */}
      {selectedRequest && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-xl animate-fade-in text-right">
           <div className="bg-white rounded-[4rem] w-full max-w-4xl max-h-[90vh] shadow-3xl border border-slate-100 animate-fade-in-up overflow-hidden flex flex-col">
              
              <div className="p-12 md:p-16 overflow-y-auto flex-1 space-y-12">
                 <div className="flex justify-between items-start">
                    <button onClick={() => setSelectedRequest(null)} className="p-3 hover:bg-slate-100 rounded-2xl transition-all font-black text-slate-400">✕ إغلاق</button>
                    <div className="flex items-center gap-6">
                       <div className="text-right">
                          <h3 className="text-3xl font-black text-slate-900 leading-none">{selectedRequest.startup.name}</h3>
                          <p className="text-blue-600 font-bold mt-2 uppercase tracking-widest text-xs">{selectedRequest.startup.industry}</p>
                       </div>
                       <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center text-5xl shadow-inner border border-slate-100">🚀</div>
                    </div>
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="p-8 bg-slate-50 rounded-[2.5rem] border border-slate-100 text-center">
                       <p className="text-4xl font-black text-slate-900">{selectedRequest.startup.metrics.readiness}%</p>
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2">مؤشر الجاهزية</p>
                    </div>
                    <div className="p-8 bg-slate-50 rounded-[2.5rem] border border-slate-100 text-center">
                       <p className="text-4xl font-black text-blue-600">{(selectedRequest.startup as any).currentTrack || 'Idea'}</p>
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2">مسار المشروع</p>
                    </div>
                    <div className="p-8 bg-emerald-50 rounded-[2.5rem] border border-emerald-100 text-center">
                       <p className="text-xl font-black text-emerald-700">{selectedRequest.owner.firstName} {selectedRequest.owner.lastName}</p>
                       <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mt-2">المؤسس الرئيسي</p>
                    </div>
                 </div>

                 <div className="space-y-8">
                    <div className="space-y-4">
                       <h4 className="text-xl font-black text-slate-900 flex items-center gap-3">
                          <span className="w-1.5 h-6 bg-blue-600 rounded-full"></span>
                          عن المشروع والمهمة
                       </h4>
                       <p className="text-lg text-slate-600 leading-relaxed font-medium bg-slate-50 p-8 rounded-3xl border border-slate-100">
                          {selectedRequest.startup.description}
                       </p>
                    </div>

                    <div className="p-10 bg-slate-900 rounded-[3rem] text-white relative overflow-hidden group">
                       <div className="absolute top-[-20px] left-[-20px] text-9xl opacity-10 group-hover:rotate-12 transition-transform">🤖</div>
                       <h4 className="text-sm font-black text-blue-400 uppercase tracking-widest mb-4 flex items-center gap-3 relative z-10">
                          <span className="w-1.5 h-4 bg-blue-500 rounded-full"></span>
                          تحليل Gemini الاستراتيجي للمشروع
                       </h4>
                       <p className="text-xl font-medium leading-relaxed italic relative z-10 opacity-90">
                          "{selectedRequest.startup.aiOpinion}"
                       </p>
                    </div>
                 </div>

                 {selectedRequest.req.status === 'ACCEPTED' && (
                    <div className="p-10 bg-emerald-50 rounded-[3rem] border-2 border-emerald-200 animate-fade-in">
                       <h4 className="text-2xl font-black text-emerald-900 mb-8 flex items-center gap-4">
                          <span className="text-3xl">📱</span>
                          معلومات التواصل المباشر
                       </h4>
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="bg-white p-6 rounded-2xl shadow-sm border border-emerald-100">
                             <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">البريد الإلكتروني الرسمي</p>
                             <p className="text-lg font-black text-slate-900 font-mono">{selectedRequest.owner.email}</p>
                          </div>
                          <div className="bg-white p-6 rounded-2xl shadow-sm border border-emerald-100">
                             <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">رابط LinkedIn</p>
                             <a href={selectedRequest.owner.linkedin || '#'} target="_blank" className="text-lg font-black text-blue-600 hover:underline">{selectedRequest.owner.linkedin ? 'عرض الملف المهني ↗' : 'غير متوفر'}</a>
                          </div>
                       </div>
                       <p className="mt-8 text-xs font-bold text-emerald-600 text-center italic">"تواصل الآن لبدء مرحلة المواءمة والتأسيس المشترك."</p>
                    </div>
                 )}

                 <div className="space-y-4">
                    <h4 className="text-lg font-black text-slate-900 flex items-center gap-3">
                       <span className="w-1.5 h-6 bg-amber-500 rounded-full"></span>
                       رسالة من المؤسس لك:
                    </h4>
                    <p className="text-lg font-bold text-slate-700 leading-relaxed bg-amber-50/50 p-8 rounded-3xl border border-amber-100 italic">
                       "{selectedRequest.req.message}"
                    </p>
                 </div>
              </div>

              <div className="p-10 border-t border-slate-100 bg-slate-50 flex gap-6">
                 {selectedRequest.req.status === 'PENDING' ? (
                   <>
                      <button 
                        onClick={() => handleRequestAction(selectedRequest.req.id, 'REJECTED')}
                        className="flex-1 py-6 bg-white border-4 border-slate-200 text-slate-500 rounded-[2rem] font-black text-xl hover:bg-rose-50 hover:text-rose-500 hover:border-rose-200 transition-all"
                      >
                         رفض الانضمام
                      </button>
                      <button 
                        onClick={() => handleRequestAction(selectedRequest.req.id, 'ACCEPTED')}
                        className="flex-[2] py-6 bg-emerald-600 text-white rounded-[2rem] font-black text-xl shadow-3xl shadow-emerald-500/20 hover:bg-emerald-700 transition-all active:scale-95 flex items-center justify-center gap-4"
                      >
                         <span>قبول وبدء التواصل</span>
                         <span className="text-2xl">🤝</span>
                      </button>
                   </>
                 ) : (
                   <button 
                    onClick={() => setSelectedRequest(null)}
                    className="w-full py-6 bg-slate-900 text-white rounded-[2rem] font-black text-xl shadow-xl transition-all"
                   >
                      إغلاق نافذة التفاصيل
                   </button>
                 )}
              </div>
           </div>
        </div>
      )}
    </div>
  );
};
