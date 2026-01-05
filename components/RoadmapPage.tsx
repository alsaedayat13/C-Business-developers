
import React from 'react';

interface RoadmapPageProps {
  onStart: () => void;
  onBack: () => void;
}

export const RoadmapPage: React.FC<RoadmapPageProps> = ({ onStart, onBack }) => {
  const levels = [
    { id: 1, title: 'التحقق الاستراتيجي', desc: 'دراسة جدوى المشكلة وصحة الفرضيات الأولية للسوق عبر محركات التحليل الذكية.', icon: '🌐' },
    { id: 2, title: 'هيكلة نموذج العمل', desc: 'تصميم محرك الإيرادات والقيمة المضافة لضمان استدامة الكيان المؤسسي على المدى الطويل.', icon: '🏗️' },
    { id: 3, title: 'رادار السوق التنافسي', desc: 'تحليل دقيق للمنافسين وتحديد الميزة التنافسية الجوهرية (The Unfair Advantage).', icon: '📡' },
    { id: 4, title: 'بناء النواة التقنية (MVP)', desc: 'تطوير النسخة الأولى القابلة للاختبار الميداني والنمو السريع بأقل الموارد.', icon: '🧪' },
    { id: 5, title: 'النمذجة المالية الاستثمارية', desc: 'إعداد قوائم التدفقات النقدية، تقييم المشروع، وجاهزية الجولة الاستثمارية.', icon: '💹' },
    { id: 6, title: 'يوم العرض والاعتماد', desc: 'العرض النهائي أمام لجنة من المستثمرين المعتمدين وقرار المسار المؤسسي النهائي.', icon: '🏆' },
  ];

  return (
    <div className="bg-white pt-48 pb-40 px-12 min-h-screen font-sans selection:bg-blue-50" dir="rtl">
      <div className="max-w-7xl mx-auto">
        <div className="mb-40 space-y-10 animate-reveal max-w-4xl border-r-[12px] border-slate-900 pr-12">
           <h2 className="text-6xl md:text-8xl font-black text-slate-900 tracking-tighter leading-none">مسار النضج <br/> <span className="text-blue-600">الاستراتيجي.</span></h2>
           <p className="text-slate-400 text-2xl md:text-3xl font-medium leading-relaxed max-w-2xl">ستة مراحل محورية تفصل بين الفكرة المجردة والكيان المؤسسي المكتمل والجاهز للاستثمار.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-32 gap-y-40">
           {levels.map((level) => (
             <div key={level.id} className="group relative pt-12 animate-reveal" style={{ animationDelay: `${level.id * 0.1}s` }}>
                <div className="absolute -top-6 -right-4 text-9xl font-black text-slate-50 opacity-[0.4] select-none z-0">0{level.id}</div>
                <div className="relative z-10">
                   <div className="flex justify-between items-center mb-10">
                      <span className="text-4xl grayscale group-hover:grayscale-0 transition-all duration-700 transform group-hover:scale-125">{level.icon}</span>
                      <span className="text-[11px] font-black text-slate-300 uppercase tracking-[0.4em]">Protocol Step 0{level.id}</span>
                   </div>
                   <h3 className="text-4xl font-black text-slate-900 mb-6 group-hover:text-blue-600 transition-colors">{level.title}</h3>
                   <p className="text-slate-500 font-medium leading-relaxed text-xl max-w-md italic border-r-2 border-slate-100 pr-6 group-hover:border-blue-200 transition-colors">
                     {level.desc}
                   </p>
                </div>
                <div className="absolute -bottom-12 right-0 w-0 h-1 bg-blue-600 group-hover:w-full transition-all duration-1000 ease-out"></div>
             </div>
           ))}
        </div>

        <div className="mt-64 flex flex-col items-center gap-10 animate-reveal">
           <div className="w-1 h-32 bg-gradient-to-b from-slate-900 to-transparent"></div>
           <button 
             onClick={onStart} 
             className="px-20 py-8 bg-slate-900 text-white text-xl font-black rounded-[3rem] shadow-3xl hover:bg-blue-600 transition-all transform hover:scale-105 active:scale-95 flex items-center gap-6 group"
           >
              <span>انضم للدفعة القادمة الآن</span>
              <svg className="w-8 h-8 transform rotate-180 group-hover:-translate-x-2 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
           </button>
           <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.5em]">Verified Strategy Framework • v2.0</p>
        </div>
      </div>
    </div>
  );
};
