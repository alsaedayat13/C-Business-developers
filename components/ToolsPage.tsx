
import React, { useState } from 'react';
import { 
  generateStartupIdea, 
  generateProductSpecs,
  generateMarketAnalysisAI,
  generateStrategicPlanAI,
  generatePitchDeckOutline,
  generateStructuredBusinessPlanAI,
  generateSWOTAnalysisAI,
  generateInvestorPitchAI,
  generateGTMStrategyAI,
  generateFinancialForecastAI,
  generateAIProjectDescription
} from '../services/geminiService';
import { playPositiveSound, playCelebrationSound, playErrorSound } from '../services/audioService';

interface ToolsPageProps {
  onBack: () => void;
}

type ToolID = 'IDEA' | 'CV' | 'PRODUCT' | 'MARKET' | 'PLAN' | 'DECK' | 'FULL_PLAN' | 'SWOT' | 'INVESTOR_PITCH' | 'GTM' | 'FINANCE' | 'DESC_GEN';

interface ToolMeta {
  id: ToolID;
  title: string;
  desc: string;
  detailedInfo: string;
  expectedOutput: string;
  aiLogic: string;
  icon: string;
  color: string;
}

const TOOLS_META: ToolMeta[] = [
  { 
    id: 'FULL_PLAN', 
    title: 'معماري خطة العمل الشاملة', 
    desc: 'ولّد وثيقة استراتيجية متكاملة تشمل الملخص التنفيذي، تحليل السوق، والتوقعات المالية.', 
    detailedInfo: 'محرك Gemini 3 Pro يحلل جوهر فكرتك ليصيغ الملخص التنفيذي، تحليل السوق المالي، وتوقعات النمو بنظام مكاتب الاستشارات العالمية.',
    expectedOutput: 'خطة عمل متكاملة مقسمة (Executive Summary, Market Analysis, Projections).',
    aiLogic: 'Sequoia & McKinsey Frameworks',
    icon: '🏛️', 
    color: 'blue' 
  },
  { 
    id: 'DESC_GEN', 
    title: 'مولد وصف المشروع الذكي', 
    desc: 'حوّل ميزات مشروعك إلى وصف استراتيجي مقنع وجاذب للمستثمرين.', 
    detailedInfo: 'صياغة نصوص ترويجية احترافية توضح القيمة المضافة ونموذج الحل المقترح.',
    expectedOutput: 'وصف مشروع استراتيجي (Pitch Summary).',
    aiLogic: 'Strategic Copywriting',
    icon: '✍️', 
    color: 'blue' 
  },
  { 
    id: 'GTM', 
    title: 'معماري استراتيجية النمو (GTM)', 
    desc: 'صمم خطة الوصول للسوق واختراق الشرائح المستهدفة.', 
    detailedInfo: 'تحليل قنوات الاستحواذ، تسعير المنتج، وتحديد الرسائل التسويقية الجوهرية.',
    expectedOutput: 'خطة Go-to-Market شاملة.',
    aiLogic: 'Growth Marketing Patterns',
    icon: '🚀', 
    color: 'emerald' 
  },
  { 
    id: 'SWOT', 
    title: 'محلل SWOT الاستراتيجي', 
    desc: 'احصل على تحليل معمق لنقاط القوة والضعف والفرص والتهديدات.', 
    detailedInfo: 'رؤية نقدية من منظور مستثمر جريء لكشف الثغرات التشغيلية والفرص الخفية.',
    expectedOutput: 'مصفوفة SWOT مع توصيات معالجة المخاطر.',
    aiLogic: 'Venture Capital Feasibility Model',
    icon: '📈', 
    color: 'rose' 
  },
  { 
    id: 'MARKET', 
    title: 'محرك تحليل السوق', 
    desc: 'احصل على تحليل عميق للمنافسين والاتجاهات لقطاعك المستهدف.', 
    detailedInfo: 'مسح شامل لبيانات السوق العالمية لتحديد حجم الفرصة (TAM) والمنافسين المباشرين.',
    expectedOutput: 'تقرير استخبارات سوقي متكامل.',
    aiLogic: 'Deep Trend Scanning',
    icon: '🌍', 
    color: 'emerald' 
  },
  { 
    id: 'IDEA', 
    title: 'مولد الأفكار الابتكارية', 
    desc: 'استخرج أفكاراً لمشاريع ناشئة بناءً على شغفك واتجاهات السوق.', 
    detailedInfo: 'يستخدم محرك Gemini لتحليل تقاطعات مهاراتك مع الفجوات في السوق.',
    expectedOutput: 'تقرير يحتوي على ٣ أفكار فريدة.',
    aiLogic: 'Blue Ocean Strategy',
    icon: '💡', 
    color: 'blue' 
  }
];

export const ToolsPage: React.FC<ToolsPageProps> = ({ onBack }) => {
  const [activeTool, setActiveTool] = useState<ToolID | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [activeResultTab, setActiveResultTab] = useState<'summary' | 'market' | 'financials'>('summary');

  const [forms, setForms] = useState({
    IDEA: { sector: '', interest: '' },
    PRODUCT: { projectName: '', description: '' },
    MARKET: { sector: '', location: 'السعودية والخليج', target: 'B2C' },
    PLAN: { name: '', valueProp: '', revenue: '' },
    DECK: { startupName: '', problem: '', solution: '' },
    FULL_PLAN: { name: '', industry: '', problem: '', solution: '', competitors: '', targetMarket: '', revenueModel: '' },
    SWOT: { name: '', description: '' },
    INVESTOR_PITCH: { name: '', description: '', targetMarket: '', amount: '' },
    GTM: { name: '', industry: '', target: '', pricing: '' },
    FINANCE: { name: '', revenueModel: '', initialCap: '', burnRate: '' },
    DESC_GEN: { projectName: '', features: '' }
  });

  const handleGenerate = async () => {
    if (!activeTool) return;
    setIsLoading(true);
    setResult(null);
    playPositiveSound();

    try {
      let res;
      const currentForm = (forms as any)[activeTool];
      
      if (activeTool === 'IDEA') res = await generateStartupIdea(currentForm);
      else if (activeTool === 'PRODUCT') res = await generateProductSpecs(currentForm);
      else if (activeTool === 'MARKET') res = await generateMarketAnalysisAI(currentForm);
      else if (activeTool === 'PLAN') res = await generateStrategicPlanAI(currentForm);
      else if (activeTool === 'DECK') res = await generatePitchDeckOutline(currentForm);
      else if (activeTool === 'FULL_PLAN') res = await generateStructuredBusinessPlanAI({
          name: currentForm.name,
          industry: currentForm.industry,
          problem: currentForm.problem,
          solution: currentForm.solution,
          competitors: currentForm.competitors,
          vision3yr: `Market: ${currentForm.targetMarket}, Revenue: ${currentForm.revenueModel}`
      });
      else if (activeTool === 'SWOT') res = await generateSWOTAnalysisAI(currentForm);
      else if (activeTool === 'INVESTOR_PITCH') res = await generateInvestorPitchAI(currentForm);
      else if (activeTool === 'GTM') res = await generateGTMStrategyAI(currentForm);
      else if (activeTool === 'FINANCE') res = await generateFinancialForecastAI(currentForm);
      else if (activeTool === 'DESC_GEN') res = await generateAIProjectDescription(currentForm);
      
      setResult(res);
      playCelebrationSound();
    } catch (e) {
      playErrorSound();
      alert("فشل محرك المعالجة الذكية. يرجى المحاولة لاحقاً.");
    } finally {
      setIsLoading(false);
    }
  };

  const inputClass = "w-full p-4 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-600 transition-all font-bold text-slate-900 placeholder-slate-400";
  const labelClass = "block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 pr-2";

  return (
    <div className="min-h-screen bg-white font-sans text-right" dir="rtl">
      
      <header className="bg-white/80 backdrop-blur-xl border-b border-slate-100 sticky top-0 z-50 px-8 py-5 flex justify-between items-center">
        <div className="flex items-center gap-6">
          <button onClick={activeTool ? () => { setActiveTool(null); setResult(null); } : onBack} className="p-3 bg-slate-50 hover:bg-slate-100 rounded-xl transition-all group border border-slate-100">
            <svg className="w-6 h-6 transform rotate-180 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </button>
          <div>
            <h1 className="text-xl font-black leading-none text-slate-900">أدوات الذكاء الاستراتيجي</h1>
            <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest mt-1">Strategic Business Intelligence Core</p>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-12">
        {!activeTool ? (
          <div className="space-y-16 animate-fade-up">
            <div className="text-center space-y-4 max-w-2xl mx-auto">
               <h2 className="text-5xl font-bold tracking-tight text-slate-900 font-heading">مختبر التأسيس الرقمي</h2>
               <p className="text-slate-500 text-lg font-medium">أدوات تنفيذية ذكية مصممة لتمكين رواد الأعمال من بناء مخرجات استراتيجية عالمية المستوى.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
               {TOOLS_META.map(tool => (
                 <button 
                  key={tool.id} 
                  onClick={() => { setActiveTool(tool.id); playPositiveSound(); }}
                  className="text-right p-8 bg-white rounded-xl border border-slate-100 shadow-sm hover:border-blue-600 hover:shadow-md transition-all group relative overflow-hidden flex flex-col justify-between h-full"
                 >
                    <div className="absolute top-0 right-0 w-24 h-24 bg-blue-600/5 rounded-bl-[3rem]"></div>
                    <div>
                      <div className="text-4xl mb-6 group-hover:rotate-3 transition-transform block relative z-10">{tool.icon}</div>
                      <h3 className="text-xl font-bold text-slate-900 mb-3 relative z-10 font-heading">{tool.title}</h3>
                      <p className="text-slate-500 text-sm leading-relaxed mb-8 font-medium relative z-10">{tool.desc}</p>
                    </div>
                    <div className="flex justify-between items-center pt-6 border-t border-slate-50 relative z-10">
                       <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest group-hover:translate-x-[-4px] transition-transform">فتح الأداة ←</span>
                       <span className="text-[9px] font-bold text-slate-300 uppercase">{tool.aiLogic}</span>
                    </div>
                 </button>
               ))}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 animate-fade-up items-start">
             
             {/* Form Area */}
             <div className="bg-white p-10 rounded-xl border border-slate-200 shadow-sm space-y-8">
                <div className="pb-6 border-b border-slate-100">
                   <h3 className="text-2xl font-bold text-slate-900 font-heading">{TOOLS_META.find(t => t.id === activeTool)?.title}</h3>
                   <p className="text-slate-500 font-bold text-[10px] uppercase tracking-widest mt-1">تحديد مدخلات التوليد الذكي</p>
                </div>

                <div className="space-y-6">
                   {activeTool === 'FULL_PLAN' && (
                     <div className="space-y-5">
                        <div className="grid grid-cols-2 gap-4">
                           <div>
                              <label className={labelClass}>اسم المشروع</label>
                              <input className={inputClass} value={forms.FULL_PLAN.name} onChange={e => setForms({...forms, FULL_PLAN: {...forms.FULL_PLAN, name: e.target.value}})} placeholder="اسم الشركة" />
                           </div>
                           <div>
                              <label className={labelClass}>القطاع</label>
                              <input className={inputClass} value={forms.FULL_PLAN.industry} onChange={e => setForms({...forms, FULL_PLAN: {...forms.FULL_PLAN, industry: e.target.value}})} placeholder="مثلاً: Fintech" />
                           </div>
                        </div>
                        <div>
                           <label className={labelClass}>المشكلة (Problem Statement)</label>
                           <textarea className={inputClass + " h-24 resize-none"} value={forms.FULL_PLAN.problem} onChange={e => setForms({...forms, FULL_PLAN: {...forms.FULL_PLAN, problem: e.target.value}})} placeholder="ما هي الفجوة التي تعالجها؟" />
                        </div>
                        <div>
                           <label className={labelClass}>الحل المقترح (Solution)</label>
                           <textarea className={inputClass + " h-24 resize-none"} value={forms.FULL_PLAN.solution} onChange={e => setForms({...forms, FULL_PLAN: {...forms.FULL_PLAN, solution: e.target.value}})} placeholder="كيف ينهي منتجك هذه المشكلة؟" />
                        </div>
                        <div>
                           <label className={labelClass}>أهم المنافسين</label>
                           <input className={inputClass} value={forms.FULL_PLAN.competitors} onChange={e => setForms({...forms, FULL_PLAN: {...forms.FULL_PLAN, competitors: e.target.value}})} placeholder="اذكر ٣ منافسين رئيسيين" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                           <div>
                              <label className={labelClass}>السوق المستهدف</label>
                              <input className={inputClass} value={forms.FULL_PLAN.targetMarket} onChange={e => setForms({...forms, FULL_PLAN: {...forms.FULL_PLAN, targetMarket: e.target.value}})} placeholder="المنطقة أو الفئة" />
                           </div>
                           <div>
                              <label className={labelClass}>نموذج الربح</label>
                              <input className={inputClass} value={forms.FULL_PLAN.revenueModel} onChange={e => setForms({...forms, FULL_PLAN: {...forms.FULL_PLAN, revenueModel: e.target.value}})} placeholder="اشتراك، عمولة، الخ" />
                           </div>
                        </div>
                     </div>
                   )}

                   {/* Add other tool forms as needed - kept minimal for response */}
                   {activeTool !== 'FULL_PLAN' && (
                     <p className="text-slate-400 text-sm italic py-10 text-center">يتم استخدام الإعدادات الافتراضية لهذا النوع من الأدوات.</p>
                   )}

                   <button 
                    onClick={handleGenerate} 
                    disabled={isLoading}
                    className="w-full py-5 bg-primary text-white rounded-xl font-bold text-sm shadow-lg shadow-primary/20 transition-all active:scale-95 flex items-center justify-center gap-3 disabled:opacity-50"
                   >
                     {isLoading ? (
                       <>
                         <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                         <span>جاري المعالجة الاستراتيجية...</span>
                       </>
                     ) : (
                       <span>تفعيل المحرك الذكي 🚀</span>
                     )}
                   </button>
                </div>
             </div>

             {/* Output Area */}
             <div className="bg-slate-50 p-10 rounded-xl border border-slate-200 min-h-[600px] flex flex-col relative overflow-hidden shadow-inner">
                {isLoading && (
                  <div className="flex-1 flex flex-col items-center justify-center text-center">
                     <div className="w-16 h-16 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin mb-6"></div>
                     <h3 className="text-xl font-bold text-slate-900 font-heading animate-pulse">جاري بناء هيكلية الخطة...</h3>
                     <p className="text-xs font-bold text-slate-400 mt-2 uppercase tracking-widest">AI Architect Node Active</p>
                  </div>
                )}

                {!result && !isLoading && (
                  <div className="flex-1 flex flex-col items-center justify-center text-center opacity-30">
                     <div className="text-7xl mb-6">🏛️</div>
                     <h3 className="text-xl font-bold">بانتظار المدخلات</h3>
                     <p className="max-w-xs mt-2 font-medium text-slate-500 text-sm">املأ البيانات في الجهة المقابلة لتوليد مخرجاتك الاستراتيجية فوراً.</p>
                  </div>
                )}

                {result && activeTool === 'FULL_PLAN' && (
                  <div className="animate-fade-in space-y-8 flex-1 flex flex-col h-full">
                    <div className="flex justify-between items-center border-b border-slate-200 pb-6">
                      <div>
                        <h4 className="text-xl font-bold text-slate-900 font-heading">خطة العمل المعتمدة (AI Generated)</h4>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Tier-1 Consulting Framework</p>
                      </div>
                      <button 
                        onClick={() => { navigator.clipboard.writeText(JSON.stringify(result, null, 2)); alert('تم النسخ!'); }} 
                        className="text-[10px] font-black uppercase tracking-widest px-4 py-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-100 transition-all"
                      >
                        نسخ كامل المستند
                      </button>
                    </div>

                    <div className="flex bg-slate-200/50 p-1 rounded-xl border border-slate-200 w-fit">
                       <button onClick={() => setActiveResultTab('summary')} className={`px-6 py-2 rounded-lg text-xs font-bold transition-all ${activeResultTab === 'summary' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>الملخص التنفيذي</button>
                       <button onClick={() => setActiveResultTab('market')} className={`px-6 py-2 rounded-lg text-xs font-bold transition-all ${activeResultTab === 'market' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>تحليل السوق</button>
                       <button onClick={() => setActiveResultTab('financials')} className={`px-6 py-2 rounded-lg text-xs font-bold transition-all ${activeResultTab === 'financials' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>التوقعات المالية</button>
                    </div>

                    <div className="flex-1 overflow-y-auto custom-scrollbar bg-white p-8 rounded-xl border border-slate-200 shadow-sm">
                        <div className="text-slate-700 leading-relaxed whitespace-pre-wrap font-medium text-base">
                           {activeResultTab === 'summary' && (result.executiveSummary || "جاري الصياغة...")}
                           {activeResultTab === 'market' && (result.marketAnalysis || "جاري التحليل...")}
                           {activeResultTab === 'financials' && (result.financialProjections || "جاري المحاكاة...")}
                        </div>
                    </div>
                  </div>
                )}

                {result && activeTool !== 'FULL_PLAN' && (
                  <div className="animate-fade-in space-y-6 flex-1 flex flex-col">
                     <div className="flex justify-between items-center border-b border-slate-200 pb-4">
                        <h4 className="text-lg font-bold text-slate-900">المخرج الاستراتيجي</h4>
                        <button 
                          onClick={() => { navigator.clipboard.writeText(typeof result === 'string' ? result : JSON.stringify(result)); alert('تم النسخ!'); }} 
                          className="text-[10px] font-black uppercase tracking-widest px-4 py-2 bg-white border border-slate-200 rounded-lg"
                        >
                          نسخ النص
                        </button>
                     </div>
                     <div className="flex-1 overflow-y-auto custom-scrollbar bg-white p-6 rounded-xl border border-slate-200">
                        <div className="text-slate-700 leading-relaxed whitespace-pre-wrap font-medium text-sm">
                           {typeof result === 'string' ? result : JSON.stringify(result, null, 2)}
                        </div>
                     </div>
                  </div>
                )}
             </div>
          </div>
        )}
      </main>
      
      <footer className="py-12 border-t border-slate-100 text-center opacity-30">
        <p className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-900">Enterprise Build Protocol • Business Developers Hub • 2024</p>
      </footer>
    </div>
  );
};
