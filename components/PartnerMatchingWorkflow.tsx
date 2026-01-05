
import React, { useState, useMemo } from 'react';
import { UserProfile, UserRole, MatchResult, SECTORS } from '../types';
import { playPositiveSound, playCelebrationSound } from '../services/audioService';
import { storageService } from '../services/storageService';
import { runSmartMatchingAlgorithmAI } from '../services/geminiService';

interface PartnerMatchingWorkflowProps {
  user: UserProfile & { uid: string; role: UserRole; startupId?: string };
  isDark: boolean;
}

const COMMON_SKILLS = ['React', 'Node.js', 'AI', 'Fintech', 'Marketing', 'Sales', 'UI/UX', 'Finance', 'Legal', 'Cloud'];

export const PartnerMatchingWorkflow: React.FC<PartnerMatchingWorkflowProps> = ({ user, isDark }) => {
  const [mode, setMode] = useState<'AI' | 'SEARCH'>('AI');
  const [phase, setPhase] = useState<'IDLE' | 'ANALYZING' | 'RESULTS'>('IDLE');
  const [matches, setMatches] = useState<MatchResult[]>([]);
  const [selectedPartnerForRequest, setSelectedPartnerForRequest] = useState<{ partnerUid: string; name: string } | null>(null);
  const [requestMessage, setRequestMessage] = useState('');
  const [isSendingRequest, setIsSendingRequest] = useState(false);

  // Advanced Search States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [industryFilter, setIndustryFilter] = useState<string>('ALL');

  // Load partners from storage (or use extended mock for better search)
  const allPartners = useMemo(() => {
    const fromStorage = storageService.getAllPartners();
    const mockPartners = [
      { uid: 'p1', name: 'م. سارة المهدي', email: 'sara@demo.com', primaryRole: 'CTO' as const, experienceYears: 12, bio: 'خبيرة في بناء الأنظمة الموزعة والتقنيات المالية Fintech. سوابق أعمال في تحجيم منصات الدفع.', linkedin: '#', skills: ['Node.js', 'Fintech', 'AWS', 'Security', 'AI'], availabilityHours: 20, commitmentType: 'Part-time' as const, city: 'الرياض', isRemote: true, workStyle: 'Fast' as const, goals: 'Long-term' as const, isVerified: true, profileCompletion: 95 },
      { uid: 'p2', name: 'أ. فهد الكويتي', email: 'fahd@demo.com', primaryRole: 'COO' as const, experienceYears: 8, bio: 'متخصص في إدارة العمليات اللوجستية وتطوير سلاسل الإمداد. خبرة في E-commerce والبيع بالتجزئة.', linkedin: '#', skills: ['Operations', 'Supply Chain', 'Logistics', 'Retail', 'Sales'], availabilityHours: 40, commitmentType: 'Full-time' as const, city: 'جدة', isRemote: false, workStyle: 'Structured' as const, goals: 'Exit' as const, isVerified: true, profileCompletion: 88 },
      { uid: 'p3', name: 'د. ليلى القاسم', email: 'laila@demo.com', primaryRole: 'CMO' as const, experienceYears: 10, bio: 'خبيرة تسويق رقمي واستراتيجيات استحواذ. ساهمت في نمو ٣ شركات ناشئة من الصفر في قطاع التعليم.', linkedin: '#', skills: ['Marketing', 'B2B', 'SEO', 'Content Strategy', 'Education'], availabilityHours: 15, commitmentType: 'Equity-only' as const, city: 'دبي', isRemote: true, workStyle: 'Balanced' as const, goals: 'Social Impact' as const, isVerified: true, profileCompletion: 92 },
      { uid: 'p4', name: 'أ. سامي المنصور', email: 'sami@demo.com', primaryRole: 'Finance' as const, experienceYears: 15, bio: 'محلل مالي خبير في جولات التمويل وقطاع التقنية الصحية HealthTech.', linkedin: '#', skills: ['Finance', 'VC', 'HealthTech', 'Excel', 'Strategy'], availabilityHours: 10, commitmentType: 'Part-time' as const, city: 'الرياض', isRemote: true, workStyle: 'Structured' as const, goals: 'Long-term' as const, isVerified: true, profileCompletion: 90 }
    ];
    return fromStorage.length > 0 ? fromStorage : mockPartners;
  }, []);

  const toggleSkillFilter = (skill: string) => {
    setSelectedSkills(prev => 
      prev.includes(skill) ? prev.filter(s => s !== skill) : [...prev, skill]
    );
    playPositiveSound();
  };

  const filteredPartners = useMemo(() => {
    return allPartners.filter(p => {
      // Industry Filter: Check if industry name appears in bio or skills
      const matchesIndustry = industryFilter === 'ALL' || 
        p.bio.toLowerCase().includes(industryFilter.toLowerCase()) || 
        p.skills.some(s => s.toLowerCase().includes(industryFilter.toLowerCase()));

      // Skills Filter: Must have all selected skills
      const matchesSelectedSkills = selectedSkills.length === 0 || 
        selectedSkills.every(s => p.skills.some(ps => ps.toLowerCase() === s.toLowerCase()));

      // Text Query Filter
      const matchesQuery = !searchQuery || 
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.skills.some(s => s.toLowerCase().includes(searchQuery.toLowerCase())) ||
        p.bio.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesIndustry && matchesSelectedSkills && matchesQuery;
    });
  }, [allPartners, searchQuery, selectedSkills, industryFilter]);

  const runAlgorithm = async () => {
    setPhase('ANALYZING');
    playPositiveSound();
    try {
      const allStartups = storageService.getAllStartups();
      const currentStartup = allStartups.find(s => s.ownerId === user.uid);
      if (!currentStartup) {
        alert("يرجى إكمال بيانات مشروعك في الملف الشخصي أولاً لتفعيل نظام المطابقة.");
        setPhase('IDLE');
        return;
      }
      const results = await runSmartMatchingAlgorithmAI(currentStartup, allPartners);
      setMatches(results.slice(0, 10));
      setPhase('RESULTS');
      playCelebrationSound();
    } catch (e) {
      setPhase('IDLE');
      alert("حدث خطأ في محرك المطابقة.");
    }
  };

  const handleSendPartnershipRequest = () => {
    if (!selectedPartnerForRequest || !requestMessage.trim()) return;
    setIsSendingRequest(true);
    playPositiveSound();
    setTimeout(() => {
      storageService.sendPartnershipRequest(
        user.startupId || 'DEMO_ID',
        user.startupName || 'مشروعي',
        selectedPartnerForRequest.partnerUid,
        requestMessage
      );
      playCelebrationSound();
      setIsSendingRequest(false);
      setSelectedPartnerForRequest(null);
      setRequestMessage('');
    }, 1200);
  };

  return (
    <div className="max-w-7xl mx-auto py-8 px-6 animate-fade-up text-right" dir="rtl">
      
      {/* Search & Mode Switcher */}
      <div className="flex flex-col lg:flex-row justify-between items-start gap-12 mb-16">
        <div className="space-y-6 shrink-0">
          <div className="inline-flex p-1.5 glass-premium rounded-[1.8rem] border border-white/10 shadow-2xl">
            <button 
              onClick={() => { setMode('AI'); setPhase('IDLE'); playPositiveSound(); }}
              className={`px-10 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${mode === 'AI' ? 'bg-electric-blue text-white shadow-xl' : 'text-slate-500 hover:text-slate-300'}`}
            >
              مطابقة ذكية (AI)
            </button>
            <button 
              onClick={() => { setMode('SEARCH'); playPositiveSound(); }}
              className={`px-10 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${mode === 'SEARCH' ? 'bg-electric-blue text-white shadow-xl' : 'text-slate-500 hover:text-slate-300'}`}
            >
              بحث متقدم
            </button>
          </div>
          {mode === 'SEARCH' && (
            <div className="flex flex-col gap-4">
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest pr-2">تصفية حسب المهارات الشائعة:</p>
              <div className="flex flex-wrap gap-2 max-w-sm">
                {COMMON_SKILLS.map(skill => (
                  <button
                    key={skill}
                    onClick={() => toggleSkillFilter(skill)}
                    className={`px-3 py-1.5 rounded-xl text-[10px] font-black border transition-all
                      ${selectedSkills.includes(skill) 
                        ? 'bg-electric-blue border-electric-blue text-white shadow-lg' 
                        : 'bg-white/5 border-white/5 text-slate-500 hover:border-white/20'}
                    `}
                  >
                    {skill}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {mode === 'SEARCH' && (
          <div className="flex-1 w-full space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="relative">
                <input 
                  type="text" 
                  placeholder="ابحث بالاسم أو المهارات..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full p-6 bg-white/5 border border-white/10 rounded-[2rem] outline-none focus:border-electric-blue transition-all font-bold text-white placeholder-slate-600 shadow-inner"
                />
                <span className="absolute left-6 top-6 opacity-30 text-xl">🔍</span>
              </div>
              <select 
                className="w-full p-6 bg-white/5 border border-white/10 rounded-[2rem] text-white font-black outline-none cursor-pointer focus:border-electric-blue shadow-inner"
                value={industryFilter}
                onChange={e => setIndustryFilter(e.target.value)}
              >
                <option value="ALL">كافة القطاعات الصناعية</option>
                {SECTORS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </div>
            {selectedSkills.length > 0 && (
              <div className="flex items-center gap-4 px-4">
                <p className="text-[10px] font-black text-electric-blue uppercase">نشط حالياً:</p>
                <div className="flex gap-2">
                  {selectedSkills.map(s => (
                    <span key={s} className="px-3 py-1 bg-electric-blue/10 text-electric-blue rounded-full text-[9px] font-black border border-electric-blue/20 flex items-center gap-2">
                      {s} <button onClick={() => toggleSkillFilter(s)} className="hover:text-white">×</button>
                    </span>
                  ))}
                  <button onClick={() => setSelectedSkills([])} className="text-[9px] font-black text-rose-500 underline underline-offset-4">مسح الكل</button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {mode === 'AI' ? (
        <>
          {phase === 'IDLE' && (
            <div className="space-y-16 py-16 animate-fade-in text-center">
              <div className="space-y-8">
                <div className="inline-flex items-center gap-3 px-8 py-3 bg-electric-blue/10 border border-electric-blue/20 text-electric-blue text-[11px] font-black uppercase tracking-[0.4em] rounded-full">
                  <span className="w-2 h-2 bg-electric-blue rounded-full animate-pulse"></span>
                  AI Synergy Discovery
                </div>
                <h2 className="text-6xl md:text-8xl font-black text-white tracking-tighter leading-none">مطابقة ذكية لضمان <br/> <span className="text-electric-blue">استدامة التأسيس.</span></h2>
                <p className="text-slate-500 text-xl md:text-2xl font-medium max-w-3xl mx-auto leading-relaxed">
                  يقوم محرك Gemini بتحليل مهاراتك القيادية الحالية وتحديد "القطع المفقودة" في أحجية مشروعك، ليقترح عليك الشركاء الذين يملكون الخبرات المكملة بدقة.
                </p>
              </div>
              <div className="pt-12">
                <button 
                  onClick={runAlgorithm}
                  className="px-20 py-8 bg-electric-blue text-white rounded-[2.5rem] font-black text-2xl hover:bg-blue-700 transition-all shadow-3xl shadow-electric-blue/30 active:scale-95 flex items-center gap-6 mx-auto btn-glow"
                >
                  <span>تفعيل محرك البحث الذكي</span>
                  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                </button>
              </div>
            </div>
          )}

          {phase === 'ANALYZING' && (
            <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-12 animate-fade-in">
              <div className="w-48 h-48 border-[12px] border-white/5 rounded-full relative">
                <div className="absolute inset-[-12px] border-[12px] border-electric-blue rounded-full border-t-transparent animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center text-6xl">🤖</div>
              </div>
              <div className="text-center space-y-4">
                <h3 className="text-3xl font-black text-white">جاري تحليل بروفايلات الشركاء...</h3>
                <p className="text-slate-500 text-lg font-medium animate-pulse tracking-widest uppercase">Matching logic: Skills x Industry x Style</p>
              </div>
            </div>
          )}

          {phase === 'RESULTS' && (
            <div className="grid grid-cols-1 gap-8 animate-fade-up">
              {matches.map((match, i) => (
                <div key={match.id} className="glass-card p-12 flex flex-col lg:flex-row items-center gap-12 group hover:border-electric-blue/50 transition-all duration-700 rounded-[4rem]">
                  <div className="text-7xl font-black text-white/5 shrink-0 tabular-nums select-none">0{i+1}</div>
                  <div className="w-28 h-28 bg-white/5 rounded-[2.5rem] flex items-center justify-center text-7xl shrink-0 group-hover:scale-110 group-hover:rotate-3 transition-transform shadow-2xl border border-white/5">👤</div>
                  <div className="flex-1 space-y-8">
                    <div className="flex flex-col md:flex-row md:items-center gap-4">
                      <h4 className="text-3xl font-black text-white">{match.name}</h4>
                      <span className="px-5 py-1.5 bg-electric-blue/10 text-electric-blue text-[11px] font-black rounded-full uppercase tracking-widest border border-electric-blue/20 w-fit">{match.role}</span>
                    </div>
                    <p className="text-slate-400 text-xl leading-relaxed font-medium italic pr-8 border-r-4 border-electric-blue/30">
                      "{match.reason}"
                    </p>
                    <div className="flex flex-wrap gap-3">
                       {['المهارات الفنية', 'توافق النمط', 'الخبرة القطاعية'].map(tag => (
                         <span key={tag} className="text-[10px] font-black text-slate-500 uppercase tracking-widest border border-white/10 px-4 py-2 rounded-2xl group-hover:text-white transition-colors">Elite compatibility: {tag}</span>
                       ))}
                    </div>
                  </div>
                  <div className="shrink-0 flex flex-col items-center gap-8 min-w-[200px]">
                    <div className="text-center">
                      <p className="text-7xl font-black text-electric-blue tracking-tighter leading-none tabular-nums">{match.totalScore}%</p>
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-3">Matching Index</p>
                    </div>
                    <button 
                      onClick={() => setSelectedPartnerForRequest({ partnerUid: match.partnerUid, name: match.name })}
                      className="w-full px-12 py-5 bg-white text-slate-950 rounded-[1.8rem] font-black text-sm hover:bg-electric-blue hover:text-white transition-all shadow-xl active:scale-95"
                    >
                      فتح قناة تواصل
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      ) : (
        <div className="space-y-12">
          <div className="flex justify-between items-center px-4">
            <h3 className="text-2xl font-black text-white">نتائج البحث المخصص <span className="text-slate-500 mr-2">({filteredPartners.length} شريك متاح)</span></h3>
            <div className="flex gap-2">
              <span className="w-2 h-2 rounded-full bg-saudi-green"></span>
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Live Inventory</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-32 animate-fade-in">
            {filteredPartners.length > 0 ? filteredPartners.map((partner) => (
              <div key={partner.uid} className="glass-card p-12 rounded-[4rem] flex flex-col justify-between hover:border-electric-blue/50 transition-all duration-700 group relative overflow-hidden h-full">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-bl-[5rem] group-hover:scale-125 transition-transform duration-1000"></div>
                <div>
                  <div className="flex justify-between items-start mb-10">
                    <div className="w-20 h-20 bg-white/5 rounded-[2rem] flex items-center justify-center text-4xl shadow-inner group-hover:rotate-6 transition-transform border border-white/5">👤</div>
                    <span className="px-5 py-2 bg-electric-blue/10 text-electric-blue text-[11px] font-black rounded-full uppercase tracking-widest border border-electric-blue/20">{partner.primaryRole}</span>
                  </div>
                  <h4 className="text-3xl font-black text-white mb-3 flex items-center gap-2">
                    {partner.name}
                    <span className="text-sm opacity-30 group-hover:opacity-100 transition-opacity">🌟</span>
                  </h4>
                  <p className="text-xs text-slate-500 font-bold mb-8 uppercase tracking-widest">{partner.experienceYears} سنوات خبرة • {partner.city}</p>
                  <p className="text-slate-400 text-lg leading-relaxed font-medium mb-10 line-clamp-4 italic border-r-2 border-white/10 pr-4">"{partner.bio}"</p>
                  
                  <div className="flex flex-wrap gap-2 mb-12">
                    {partner.skills.map(s => {
                      const isHighlighted = selectedSkills.includes(s) || (searchQuery && s.toLowerCase().includes(searchQuery.toLowerCase()));
                      return (
                        <span key={s} className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase border transition-all
                          ${isHighlighted 
                            ? 'bg-electric-blue border-electric-blue text-white shadow-lg' 
                            : 'bg-white/5 text-slate-500 border-white/5 group-hover:border-white/20 group-hover:text-slate-300'}
                        `}>
                          #{s}
                        </span>
                      );
                    })}
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedPartnerForRequest({ partnerUid: partner.uid, name: partner.name })}
                  className="w-full py-6 bg-white/5 text-white border border-white/10 rounded-[2.2rem] font-black text-xs hover:bg-electric-blue hover:border-electric-blue transition-all active:scale-95 btn-glow"
                >
                  تقديم دعوة شراكة
                </button>
              </div>
            )) : (
              <div className="col-span-full py-48 text-center opacity-30 flex flex-col items-center animate-fade-in">
                <span className="text-9xl mb-10">🔎</span>
                <h3 className="text-4xl font-black text-white tracking-tight">لم نجد شركاء يطابقون هذه المهارات</h3>
                <p className="text-2xl font-medium mt-4 text-slate-500">حاول تغيير الكلمات المفتاحية أو اختيار مهارات أقل تخصصاً.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Partnership Request Modal (Enhanced Cinematic Version) */}
      {selectedPartnerForRequest && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-8 bg-slate-950/90 backdrop-blur-3xl animate-fade-in text-right">
           <div className="glass-card bg-[#0f172a] rounded-[5rem] w-full max-w-3xl p-16 md:p-24 space-y-12 animate-fade-in-up border border-white/10 shadow-[0_0_100px_rgba(37,99,235,0.1)]">
              <div className="flex justify-between items-start">
                 <button onClick={() => setSelectedPartnerForRequest(null)} className="p-5 bg-white/5 hover:bg-rose-500/20 hover:text-rose-500 rounded-3xl text-slate-400 font-black transition-all">✕</button>
                 <div className="flex items-center gap-8">
                    <div className="text-right">
                       <h3 className="text-4xl font-black text-white tracking-tight">دعوة شراكة استراتيجية</h3>
                       <p className="text-electric-blue text-xl font-bold mt-2">المستقبل: {selectedPartnerForRequest.name}</p>
                    </div>
                    <div className="w-24 h-24 bg-white/5 rounded-[2.5rem] flex items-center justify-center text-6xl shadow-2xl border border-white/10">👤</div>
                 </div>
              </div>

              <div className="space-y-8">
                 <div className="flex justify-between items-center px-4">
                    <label className="text-[11px] font-black text-slate-500 uppercase tracking-[0.3em] block">لماذا اخترت هذا الشريك؟</label>
                    <span className="text-[9px] font-black text-electric-blue uppercase">AI Profile Match: Active</span>
                 </div>
                 <textarea 
                    className="w-full h-56 p-10 bg-white/5 border border-white/10 rounded-[3.5rem] outline-none focus:border-electric-blue transition-all font-medium text-xl resize-none leading-relaxed text-white shadow-inner placeholder-slate-700" 
                    placeholder="مثال: نؤمن أن خبرتك في الـ AI وتطوير Fintech هي المحرك الذي نحتاجه في مرحلة الـ MVP الحالية..." 
                    value={requestMessage}
                    onChange={e => setRequestMessage(e.target.value)}
                    required 
                 />
                 <div className="p-10 bg-electric-blue/5 border border-electric-blue/10 rounded-[3.5rem] flex gap-8 items-start relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-2 h-full bg-electric-blue"></div>
                    <span className="text-5xl mt-1 grayscale group-hover:grayscale-0 transition-all duration-500">📜</span>
                    <div>
                      <h5 className="font-black text-electric-blue text-sm uppercase tracking-widest mb-2">تنويه الشفافية الاستراتيجي</h5>
                      <p className="text-sm font-bold text-slate-400 leading-relaxed">بإرسال هذه الدعوة، سيتلقى الشريك ملخصاً تنفيذياً لمشروعك، مؤشرات الجاهزية الحالية (Readiness Index)، وخطة الطريق المعتمدة، لتمكينه من اتخاذ قرار مهني مدروس.</p>
                    </div>
                 </div>
              </div>

              <div className="pt-8 flex flex-col sm:flex-row gap-8">
                 <button onClick={() => setSelectedPartnerForRequest(null)} className="flex-1 py-7 bg-white/5 text-slate-500 rounded-[2.5rem] font-black text-xl hover:bg-white/10 transition-all border border-white/5">تجاهل</button>
                 <button 
                   onClick={handleSendPartnershipRequest}
                   disabled={isSendingRequest || !requestMessage.trim()}
                   className="flex-[2] py-7 bg-electric-blue text-white rounded-[2.5rem] font-black text-2xl hover:bg-blue-700 shadow-3xl shadow-electric-blue/30 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-6 btn-glow"
                 >
                    {isSendingRequest ? (
                      <div className="w-8 h-8 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
                    ) : (
                      <>
                        <span>تأكيد وإرسال الدعوة</span>
                        <span className="text-3xl animate-float">🚀</span>
                      </>
                    )}
                 </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};
