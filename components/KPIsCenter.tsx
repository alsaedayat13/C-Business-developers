
import React, { useMemo, useState, useEffect } from 'react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  RadarChart, PolarGrid, PolarAngleAxis, Radar, BarChart, Bar, Cell 
} from 'recharts';
import { StartupRecord, KPIRecord, RiskLevel } from '../types';
import { storageService } from '../services/storageService';
import { analyzeStartupKPIsAI } from '../services/geminiService';
import { playPositiveSound, playCelebrationSound } from '../services/audioService';

interface KPIsCenterProps {
  startup: StartupRecord;
}

interface RiskItem {
  id: string;
  category: string;
  title: string;
  impact: 'High' | 'Medium' | 'Low';
  likelihood: 'High' | 'Medium' | 'Low';
  description: string;
}

export const KPIsCenter: React.FC<KPIsCenterProps> = ({ startup: initialStartup }) => {
  const [startup, setStartup] = useState(initialStartup);
  const [isUpdating, setIsUpdating] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  useEffect(() => {
    setStartup(initialStartup);
  }, [initialStartup]);

  const kpiData = useMemo(() => {
    return startup.kpiHistory && startup.kpiHistory.length > 0 
      ? startup.kpiHistory 
      : [{ date: 'بداية', growth: 10, techReadiness: 10, marketEngagement: 5, revenue: 0, burnRate: 0 }];
  }, [startup.kpiHistory]);

  const healthScore = useMemo(() => {
    const last = kpiData[kpiData.length - 1];
    const avg = (last.growth + last.techReadiness + last.marketEngagement + startup.metrics.readiness) / 4;
    return Math.round(avg);
  }, [kpiData, startup.metrics.readiness]);

  const radarData = useMemo(() => [
    { subject: 'النمو', A: kpiData[kpiData.length - 1].growth, fullMark: 100 },
    { subject: 'التقنية', A: kpiData[kpiData.length - 1].techReadiness, fullMark: 100 },
    { subject: 'تفاعل السوق', A: kpiData[kpiData.length - 1].marketEngagement, fullMark: 100 },
    { subject: 'نموذج العمل', A: startup.metrics.readiness, fullMark: 100 },
    { subject: 'الفريق', A: startup.partners.length > 0 ? 85 : 40, fullMark: 100 },
  ], [kpiData, startup]);

  const detectedRisks = useMemo((): RiskItem[] => {
    const risks: RiskItem[] = [];
    const last = kpiData[kpiData.length - 1];
    
    if (last.burnRate > last.revenue * 1.5 && last.revenue > 0) {
      risks.push({
        id: 'r1', category: 'Financial', title: 'معدل حرق مرتفع', impact: 'High', likelihood: 'Medium',
        description: 'المصروفات تتجاوز الإيرادات بشكل قد يهدد الاستدامة المالية قبل الجولة القادمة.'
      });
    }
    if (last.techReadiness < 40 && kpiData.length > 4) {
      risks.push({
        id: 'r2', category: 'Tech', title: 'فجوة تقنية', impact: 'Medium', likelihood: 'High',
        description: 'تأخر في تطوير النواة التقنية مقارنة بالجدول الزمني للبرنامج.'
      });
    }
    if (startup.partners.length === 0) {
      risks.push({
        id: 'r3', category: 'Team', title: 'خطر المؤسس المنفرد', impact: 'Medium', likelihood: 'Low',
        description: 'الاعتماد على شخص واحد قد يقلل من جاذبية المشروع للمستثمرين في مراحل النمو.'
      });
    }
    return risks;
  }, [kpiData, startup]);

  const handleRecordUpdate = () => {
    setIsUpdating(true);
    playPositiveSound();

    const last = kpiData[kpiData.length - 1];
    const nextWeek = `أسبوع ${kpiData.length + 1}`;
    
    const newRecord: KPIRecord = {
      date: nextWeek,
      growth: Math.min(100, last.growth + Math.floor(Math.random() * 12) + 1),
      techReadiness: Math.min(100, last.techReadiness + Math.floor(Math.random() * 8) + 1),
      marketEngagement: Math.min(100, last.marketEngagement + Math.floor(Math.random() * 10) + 2),
      revenue: (last.revenue || 0) + Math.floor(Math.random() * 3500),
      burnRate: (last.burnRate || 1000) + Math.floor(Math.random() * 150)
    };

    setTimeout(() => {
      storageService.addKPIRecord(startup.projectId, newRecord);
      const updatedStartups = storageService.getAllStartups();
      const updated = updatedStartups.find(s => s.projectId === startup.projectId);
      if (updated) setStartup(updated);
      setIsUpdating(false);
      playCelebrationSound();
    }, 800);
  };

  const handleAIAnalysis = async () => {
    setIsAnalyzing(true);
    try {
      const result = await analyzeStartupKPIsAI(startup);
      setAiAnalysis(result || "تعذر الحصول على تحليل حالياً.");
    } catch (e) {
      setAiAnalysis("حدث خطأ في محرك التحليل الذكي.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-10 animate-fade-up pb-32 text-right" dir="rtl">
      
      {/* Dynamic Header & Health Score */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-stretch">
        <div className="lg:col-span-3 bg-institutional-slate p-10 rounded-[3rem] text-white relative overflow-hidden flex flex-col justify-between shadow-2xl">
           <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-[80px] -z-0"></div>
           <div className="relative z-10 flex justify-between items-start">
              <div className="space-y-2">
                 <div className="flex items-center gap-3">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                    <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Monitoring: Active</span>
                 </div>
                 <h2 className="text-4xl font-black tracking-tight">رادار الأداء الاستراتيجي</h2>
                 <p className="text-slate-400 font-medium max-w-xl">تحليل لحظي لمؤشرات الأداء الرئيسية (KPIs) للكشف المبكر عن المخاطر التشغيلية والمالية.</p>
              </div>
              <div className="flex flex-col items-center">
                 <div className="relative w-32 h-32 flex items-center justify-center">
                    <svg className="w-full h-full transform -rotate-90">
                       <circle cx="50%" cy="50%" r="45%" stroke="rgba(255,255,255,0.05)" strokeWidth="8" fill="transparent" />
                       <circle 
                        cx="50%" cy="50%" r="45%" stroke="#4F46E5" strokeWidth="8" fill="transparent" 
                        strokeDasharray="283" strokeDashoffset={283 - (283 * healthScore / 100)}
                        className="transition-all duration-1000 ease-out"
                       />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                       <span className="text-3xl font-black">{healthScore}%</span>
                    </div>
                 </div>
                 <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-2">Health Index</span>
              </div>
           </div>
           
           <div className="mt-10 flex flex-wrap gap-4 relative z-10">
              <button onClick={handleAIAnalysis} disabled={isAnalyzing} className="px-8 py-4 bg-white/5 border border-white/10 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-white/10 transition-all flex items-center gap-3 disabled:opacity-50">
                {isAnalyzing ? <div className="w-3 h-3 border-2 border-white/20 border-t-white rounded-full animate-spin"></div> : '🧠'}
                <span>ذكاء اصطناعي (Pro)</span>
              </button>
              <button onClick={handleRecordUpdate} disabled={isUpdating} className="px-8 py-4 bg-primary text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-primary/20 hover:bg-primary/90 transition-all active:scale-95 flex items-center gap-3 disabled:opacity-50">
                {isUpdating ? <div className="w-3 h-3 border-2 border-white/20 border-t-white rounded-full animate-spin"></div> : '📊'}
                <span>تحديث أسبوعي</span>
              </button>
           </div>
        </div>

        <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm flex flex-col justify-between">
           <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">خطر التعثر</p>
              <h4 className={`text-4xl font-black ${detectedRisks.length > 0 ? 'text-rose-500' : 'text-emerald-500'}`}>
                {detectedRisks.length > 0 ? 'مخاطر مكتشفة' : 'مسار آمن'}
              </h4>
           </div>
           <div className="space-y-4">
              <div className="flex justify-between items-center text-xs font-bold text-slate-500">
                 <span>تنوع الفريق</span>
                 <span className={startup.partners.length > 0 ? 'text-emerald-500' : 'text-rose-500'}>{startup.partners.length > 0 ? 'مكتمل' : 'فردي'}</span>
              </div>
              <div className="flex justify-between items-center text-xs font-bold text-slate-500">
                 <span>كفاءة الحرق</span>
                 <span className="text-emerald-500">منخفض</span>
              </div>
              <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                 <div className="bg-primary h-full transition-all duration-1000" style={{ width: `${startup.metrics.readiness}%` }}></div>
              </div>
           </div>
        </div>
      </div>

      {/* Main Charts Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Growth Trends */}
        <div className="lg:col-span-2 bg-white p-12 rounded-[4rem] border border-slate-100 shadow-sm space-y-10">
           <div className="flex justify-between items-center">
              <h3 className="text-2xl font-black text-slate-900 flex items-center gap-4">
                 <span className="w-1.5 h-8 bg-primary rounded-full"></span>
                 منحنيات النضج التراكمي
              </h3>
              <div className="flex gap-6">
                 <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-blue-500"></span><span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">النمو</span></div>
                 <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-emerald-500"></span><span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">التقنية</span></div>
              </div>
           </div>
           
           <div className="h-[380px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={kpiData}>
                  <defs>
                    <linearGradient id="colorGrowth" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorTech" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 'bold', fill: '#94a3b8'}} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 'bold', fill: '#94a3b8'}} />
                  <Tooltip 
                    contentStyle={{borderRadius: '24px', border: 'none', boxShadow: '0 20px 40px rgba(0,0,0,0.1)', padding: '20px'}}
                    itemStyle={{fontWeight: 'black', fontSize: '12px'}}
                  />
                  <Area type="monotone" dataKey="growth" stroke="#3b82f6" strokeWidth={5} fill="url(#colorGrowth)" />
                  <Area type="monotone" dataKey="techReadiness" stroke="#10b981" strokeWidth={5} fill="url(#colorTech)" />
                </AreaChart>
              </ResponsiveContainer>
           </div>
        </div>

        {/* Holistic Balance Radar */}
        <div className="bg-white p-12 rounded-[4rem] border border-slate-100 shadow-sm flex flex-col items-center justify-between">
           <h3 className="text-xl font-black mb-10 self-start flex items-center gap-4 text-slate-900">
              <span className="w-1.5 h-6 bg-primary rounded-full"></span>
              التوازن المؤسسي
           </h3>
           <div className="w-full h-[320px]">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                  <PolarGrid stroke="#f1f5f9" />
                  <PolarAngleAxis dataKey="subject" tick={{fill: '#64748b', fontSize: 10, fontWeight: 'black'}} />
                  <Radar name="Startup Metrics" dataKey="A" stroke="#4F46E5" strokeWidth={4} fill="#4F46E5" fillOpacity={0.1} />
                </RadarChart>
              </ResponsiveContainer>
           </div>
           <div className="mt-8 p-6 bg-slate-50 rounded-3xl border border-slate-100 w-full">
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Automated Assessment</p>
              <p className="text-sm text-slate-700 font-bold leading-relaxed italic">
                {healthScore > 80 ? 'المشروع يظهر كفاءة عالية في موازنة الموارد والنمو.' : 'يوصى بالتركيز على تحسين مؤشر تفاعل السوق لرفع الجاهزية.'}
              </p>
           </div>
        </div>
      </div>

      {/* Risk Monitoring Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
         <div className="bg-white p-12 rounded-[4rem] border border-slate-100 shadow-sm space-y-8">
            <h3 className="text-2xl font-black text-slate-900 flex items-center gap-4">
               <span className="w-1.5 h-8 bg-rose-500 rounded-full"></span>
               مصفوفة المخاطر المكتشفة
            </h3>
            <div className="space-y-4">
               {detectedRisks.length > 0 ? detectedRisks.map(risk => (
                 <div key={risk.id} className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100 flex items-start gap-6 group hover:border-rose-200 transition-all">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shadow-inner shrink-0
                      ${risk.impact === 'High' ? 'bg-rose-50 text-rose-500' : 'bg-amber-50 text-amber-500'}
                    `}>
                       {risk.category === 'Financial' ? '💰' : risk.category === 'Tech' ? '⚙️' : '👥'}
                    </div>
                    <div className="flex-1 space-y-1">
                       <div className="flex justify-between items-center">
                          <h4 className="font-black text-slate-900">{risk.title}</h4>
                          <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full
                            ${risk.impact === 'High' ? 'bg-rose-500 text-white' : 'bg-amber-500 text-white'}
                          `}>Impact: {risk.impact}</span>
                       </div>
                       <p className="text-sm text-slate-500 font-medium leading-relaxed">{risk.description}</p>
                    </div>
                 </div>
               )) : (
                 <div className="py-20 text-center space-y-4 opacity-40">
                    <div className="text-5xl">🛡️</div>
                    <p className="font-black text-slate-400">لا توجد مخاطر حرجة مكتشفة حالياً.</p>
                 </div>
               )}
            </div>
         </div>

         <div className="bg-white p-12 rounded-[4rem] border border-slate-100 shadow-sm space-y-8">
            <h3 className="text-2xl font-black text-slate-900 flex items-center gap-4">
               <span className="w-1.5 h-8 bg-emerald-500 rounded-full"></span>
               تحليل الاستدامة المالية
            </h3>
            <div className="h-[300px] w-full">
               <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={kpiData}>
                     <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                     <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10}} />
                     <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10}} />
                     <Tooltip 
                        cursor={{fill: 'rgba(0,0,0,0.02)'}}
                        contentStyle={{borderRadius: '24px', border: 'none', boxShadow: '0 20px 40px rgba(0,0,0,0.1)'}}
                     />
                     <Bar dataKey="revenue" fill="#10b981" radius={[8, 8, 0, 0]} name="الإيرادات" />
                     <Bar dataKey="burnRate" fill="#f43f5e" radius={[8, 8, 0, 0]} name="معدل الحرق" />
                  </BarChart>
               </ResponsiveContainer>
            </div>
            <div className="p-6 bg-blue-50 rounded-3xl border border-blue-100 flex items-start gap-4">
               <span className="text-2xl">💡</span>
               <p className="text-xs font-bold text-blue-700 leading-relaxed">
                  نصيحة: حافظ على استقرار "معدل الحرق" حتى تصل لنقطة التعادل (Break-even point) لزيادة فرصك في الحصول على تقييم مرتفع من المستثمرين.
               </p>
            </div>
         </div>
      </div>

      {/* AI Narrative Analysis */}
      {aiAnalysis && (
        <div className="animate-fade-up bg-institutional-slate p-12 md:p-16 rounded-[4rem] text-white relative overflow-hidden shadow-3xl">
           <div className="absolute top-0 right-0 w-1 h-full bg-primary"></div>
           <div className="flex justify-between items-start mb-12">
              <div className="flex items-center gap-6">
                 <div className="w-16 h-16 bg-primary rounded-3xl flex items-center justify-center text-4xl shadow-2xl">🤖</div>
                 <div>
                    <h3 className="text-3xl font-black">التقرير الاستراتيجي المتقدم (AAS)</h3>
                    <p className="text-primary font-black text-[10px] uppercase tracking-widest mt-2">Verified Business Intelligence • Gemini 3 Core</p>
                 </div>
              </div>
              <button onClick={() => setAiAnalysis(null)} className="text-slate-500 hover:text-white transition-colors p-2 text-xl font-black">✕</button>
           </div>
           <div className="text-xl font-medium leading-loose text-slate-300 whitespace-pre-wrap max-w-4xl border-r-2 border-primary/20 pr-10">
              {aiAnalysis}
           </div>
           <div className="mt-12 flex gap-4 opacity-30">
              <div className="w-2 h-2 rounded-full bg-white"></div>
              <div className="w-2 h-2 rounded-full bg-slate-700"></div>
              <div className="w-2 h-2 rounded-full bg-slate-700"></div>
           </div>
        </div>
      )}

    </div>
  );
};
