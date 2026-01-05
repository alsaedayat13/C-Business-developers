
import React from 'react';
import { Language, getTranslation } from '../services/i18nService';

interface LandingPageProps {
  onStart: () => void;
  onRoadmap: () => void;
  onImpact: () => void;
  lang: Language;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onStart, onRoadmap, onImpact, lang }) => {
  const t = getTranslation(lang);

  return (
    <div className="min-h-screen bg-white">
      
      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-8 lg:px-12 pt-40 pb-24 flex flex-col lg:flex-row items-center gap-20">
        
        {/* Right Side: Strategic Content */}
        <div className="w-full lg:w-3/5 space-y-10 text-right">
          <div className="space-y-6">
            <span className="text-[10px] font-bold tracking-[0.3em] uppercase text-slate-400 border-r-2 border-primary pr-4">
              Institutional Venture Acceleration
            </span>
            <h1 className="text-[56px] font-bold text-slate-900 leading-[1.15] tracking-tight font-heading">
              هندسة النمو <br/>
              بمنظور سيادي فاخر.
            </h1>
            <p className="text-slate-500 text-lg font-medium leading-relaxed max-w-2xl ml-auto">
              منصة احتضان وتسريع أعمال مبتكرة، صممت خصيصاً للمشاريع ذات الأثر الاستراتيجي، معتمدة على منهجية التحقق الرقمي المتقدمة لضمان الجاهزية الاستثمارية.
            </p>
          </div>

          <div className="flex flex-row-reverse gap-4">
            <button 
              onClick={onStart}
              className="btn-primary"
            >
              ابدأ التأسيس الرقمي
            </button>
            <button 
              onClick={onRoadmap}
              className="btn-secondary"
            >
              منهجية التسريع
            </button>
          </div>
        </div>

        {/* Left Side: Minimal Visual / Mockup Area */}
        <div className="w-full lg:w-2/5 flex justify-center">
           <div className="relative w-full max-w-md aspect-[4/5] bg-slate-50 rounded-xl border border-slate-100 p-8 flex flex-col justify-between shadow-sm">
              <div className="w-full aspect-video bg-white rounded-lg border border-slate-100 shadow-sm overflow-hidden flex items-center justify-center">
                 <div className="w-12 h-12 bg-primary/10 rounded-full animate-pulse flex items-center justify-center">
                    <div className="w-4 h-4 bg-primary rounded-full"></div>
                 </div>
              </div>

              <div className="space-y-4">
                 <div className="grid grid-cols-1 gap-3">
                    {[
                      { l: 'جاهزية الاستثمار', v: '92%', i: '📈' },
                      { l: 'كفاءة نموذج العمل', v: 'High', i: '💎' },
                      { l: 'دعم تقني متكامل', v: '24/7', i: '⚡' }
                    ].map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between p-4 bg-white rounded-lg border border-slate-100">
                         <div className="flex items-center gap-3">
                            <span className="text-lg">{item.i}</span>
                            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">{item.l}</span>
                         </div>
                         <span className="text-xs font-black text-slate-900">{item.v}</span>
                      </div>
                    ))}
                 </div>
              </div>
           </div>
        </div>
      </section>

      {/* Metrics */}
      <section className="border-y border-slate-100 bg-white">
        <div className="max-w-7xl mx-auto px-12 py-16">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-12">
             {[
               { label: 'نسبة النجاح', val: '92%' },
               { label: 'تمويل مستقطب', val: '$42M' },
               { label: 'مشروع نشط', val: '+1,400' },
               { label: 'كيان مؤسس', val: '185' }
             ].map((s, i) => (
               <div key={i} className="space-y-2">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{s.label}</p>
                  <h4 className="text-4xl font-bold text-slate-900 tabular-nums">{s.val}</h4>
               </div>
             ))}
          </div>
        </div>
      </section>

      {/* Philosophy */}
      <section className="max-w-7xl mx-auto px-12 section-padding grid grid-cols-1 lg:grid-cols-2 gap-24">
         <div className="space-y-6">
            <h3 className="text-3xl font-bold text-slate-900">بروتوكول التأسيس</h3>
            <p className="text-slate-500 text-lg leading-relaxed">
               نتبع منهجية صارمة تعتمد على البيانات، تبدأ من التحقق الاستراتيجي من المشكلة، وتنتهي بجاهزية الكيان للعرض على لجان الاستثمار العالمية.
            </p>
         </div>

         <div className="space-y-12">
            {[
               { t: 'التحقق الاستراتيجي', d: 'تحليل جدوى المشكلة وصحة الفرضيات الأولية عبر رادار السوق الرقمي.', i: '01' },
               { t: 'هيكلة نموذج العمل', d: 'تصميم محرك الإيرادات والقيمة لضمان استدامة الكيان على المدى الطويل.', i: '02' },
               { t: 'الجاهزية الاستثمارية', d: 'المرحلة النهائية للحصول على الاعتماد والبدء في جولات التمويل.', i: '03' }
            ].map((step, idx) => (
               <div key={idx} className="flex gap-8 group">
                  <span className="text-xs font-bold text-primary tabular-nums mt-1">{step.i}</span>
                  <div className="space-y-2">
                    <h4 className="text-lg font-bold text-slate-900 underline-offset-8 group-hover:underline">{step.t}</h4>
                    <p className="text-slate-500 text-sm leading-relaxed">{step.d}</p>
                  </div>
               </div>
            ))}
         </div>
      </section>

      {/* Gemini 3 Pro Integration Feature (Moved down) */}
      <section className="bg-slate-50 py-24 border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-12">
          <div className="bg-white rounded-xl border border-slate-200 p-12 flex flex-col md:flex-row items-center justify-between gap-12">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 rounded-full">
                <span className="w-2 h-2 bg-primary rounded-full animate-pulse"></span>
                <span className="text-[10px] font-bold text-primary uppercase tracking-widest">Powered by Gemini 3 Core</span>
              </div>
              <h3 className="text-2xl font-bold text-slate-900">التحقق الذكي المتكامل</h3>
              <p className="text-slate-500 max-w-xl font-medium">نستخدم أحدث تقنيات الذكاء الاصطناعي الاستراتيجي لفلترة المشاريع وتقديم مراجعات نقدية فورية لمخرجات رواد الأعمال قبل وصولها للمرشدين.</p>
            </div>
            <div className="w-20 h-20 bg-slate-900 rounded-lg flex items-center justify-center shadow-xl">
               <span className="text-white font-black text-xl italic">AI</span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="bg-slate-900 text-white py-32">
         <div className="max-w-7xl mx-auto px-12 text-center space-y-10">
            <h2 className="text-4xl font-bold tracking-tight font-heading">هل فكرتك جاهزة للتحول إلى كيان؟</h2>
            <p className="text-slate-400 text-lg max-w-xl mx-auto">
               انضم لمجتمع "بيزنس ديفلوبرز" وابدأ رحلة التسريع الاستراتيجية اليوم.
            </p>
            <button onClick={onStart} className="px-12 py-4 bg-primary text-white font-bold rounded-lg hover:bg-blue-700 transition-all">قدم طلب الانضمام</button>
         </div>
      </section>
    </div>
  );
};
