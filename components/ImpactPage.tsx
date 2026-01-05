
import React, { useState, useEffect } from 'react';
import { Language, getTranslation } from '../services/i18nService';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';

interface ImpactPageProps {
  onBack: () => void;
  lang: Language;
}

// مؤشرات رقمية بصياغة تحفظية ودقيقة
const STATS = [
  { label: 'إجمالي الكيانات التي أتمت البرنامج التدريبي', value: 185, suffix: '', sub: 'كيان مؤسس' },
  { label: 'نطاق الانتشار الجغرافي للمشاريع المقبولة', value: 14, suffix: '', sub: 'دولة سيادية' },
  { label: 'القيمة التقديرية للاستثمارات الموجهة للمشاريع', value: 42, suffix: 'M$', sub: 'مليون دولار' },
  { label: 'الفرص الوظيفية الناشئة عن تفعيل المشاريع', value: 2400, suffix: '', sub: 'وظيفة مهنية' },
];

const PERFORMANCE_DATA = [
  { year: '2020', funding: 5 },
  { year: '2021', funding: 12 },
  { year: '2022', funding: 22 },
  { year: '2023', funding: 35 },
  { year: '2024', funding: 42 },
];

const REGIONAL_DISTRIBUTION = [
  { name: 'المملكة العربية السعودية', count: 82, percentage: '44.3%' },
  { name: 'جمهورية مصر العربية', count: 41, percentage: '22.1%' },
  { name: 'الإمارات العربية المتحدة', count: 34, percentage: '18.3%' },
  { name: 'المملكة الأردنية الهاشمية', count: 18, percentage: '9.7%' },
  { name: 'دولة الكويت', count: 12, percentage: '6.5%' },
];

export const ImpactPage: React.FC<ImpactPageProps> = ({ onBack, lang }) => {
  const t = getTranslation(lang);

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans text-[#1E293B] selection:bg-slate-200" dir="rtl">
      {/* Header - Formal Styling */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-slate-200 px-12 py-6">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <button 
            onClick={onBack} 
            className="flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span className="text-xs font-bold tracking-widest uppercase">الرجوع للمنصة</span>
          </button>
          <div className="text-left border-r border-slate-200 pr-6">
             <h1 className="text-sm font-black uppercase tracking-[0.2em] text-slate-900">تقرير الأثر المؤسسي السنوي</h1>
             <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">نسخة العرض الرسمية 2024</p>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-12 pt-48 pb-32 space-y-24">
        
        {/* Title Section - No marketing language */}
        <section className="space-y-4 max-w-3xl border-r-4 border-slate-900 pr-8">
          <h2 className="text-4xl font-black text-slate-900 tracking-tight">الأثر المؤسسي</h2>
          <p className="text-slate-500 text-lg font-medium leading-relaxed">
            يستعرض هذا القسم مؤشرات الأداء الاستراتيجية المحققة من خلال برامج الاحتضان والتسريع، مع التركيز على المخرجات الاقتصادية والتنموية المباشرة.
          </p>
        </section>

        {/* Indicators Grid - Clean and formal */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-0 border border-slate-200 rounded-lg overflow-hidden bg-white">
           {STATS.map((s, i) => (
             <div key={i} className={`p-10 flex flex-col justify-center border-slate-100 ${i < 3 ? 'md:border-l' : ''} ${i < 2 ? 'lg:border-l' : ''}`}>
                <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-6 h-10 leading-tight">
                  {s.label}
                </p>
                <div className="flex flex-col">
                  <span className="text-5xl font-black text-slate-900 tracking-tighter tabular-nums leading-none">
                    {s.value}{s.suffix}
                  </span>
                  <span className="text-xs font-bold text-slate-500 mt-2">{s.sub}</span>
                </div>
             </div>
           ))}
        </section>

        {/* Data Visualization Section */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-12 pt-8">
           {/* Chart */}
           <div className="lg:col-span-2 space-y-8 bg-white p-12 border border-slate-200 rounded-lg shadow-sm">
              <div className="space-y-1">
                 <h3 className="text-xl font-black text-slate-900">تحليل مؤشر التدفقات الرأسمالية</h3>
                 <p className="text-xs text-slate-400 font-medium">البيانات تعكس القيمة التراكمية بالمليون دولار (2020 - 2024)</p>
              </div>
              <div className="h-[300px] w-full">
                 <ResponsiveContainer width="100%" height="100%">
                   <AreaChart data={PERFORMANCE_DATA}>
                     <CartesianGrid strokeDasharray="0 0" vertical={false} stroke="#F1F5F9" />
                     <XAxis dataKey="year" axisLine={false} tickLine={false} tick={{fontSize: 11, fontWeight: 'bold', fill: '#94A3B8'}} dy={10} />
                     <YAxis axisLine={false} tickLine={false} tick={{fontSize: 11, fontWeight: 'bold', fill: '#94A3B8'}} />
                     <Tooltip 
                       contentStyle={{ borderRadius: '4px', border: '1px solid #E2E8F0', boxShadow: 'none', padding: '12px' }}
                     />
                     <Area type="monotone" dataKey="funding" stroke="#0F172A" strokeWidth={2} fillOpacity={0.05} fill="#0F172A" />
                   </AreaChart>
                 </ResponsiveContainer>
              </div>
           </div>

           {/* Table - Regional Distribution */}
           <div className="space-y-8 bg-white p-12 border border-slate-200 rounded-lg shadow-sm">
              <div className="space-y-1">
                 <h3 className="text-xl font-black text-slate-900">التوزيع الجغرافي للمشاريع</h3>
                 <p className="text-xs text-slate-400 font-medium">حسب الكيانات المسجلة رسمياً</p>
              </div>
              <div className="space-y-4 pt-4">
                 {REGIONAL_DISTRIBUTION.map((c, i) => (
                   <div key={i} className="flex justify-between items-center py-3 border-b border-slate-50 last:border-0">
                      <div className="flex items-center gap-3">
                         <div className="w-1 h-1 bg-slate-900 rounded-full"></div>
                         <span className="text-sm font-bold text-slate-700">{c.name}</span>
                      </div>
                      <div className="text-left">
                         <span className="text-xs font-black text-slate-900">{c.count} كيان</span>
                         <span className="text-[10px] text-slate-400 mr-2">({c.percentage})</span>
                      </div>
                   </div>
                 ))}
              </div>
           </div>
        </section>

        {/* Conclusion / Note Section */}
        <section className="bg-slate-900 p-16 rounded-lg text-white space-y-6">
           <h3 className="text-xl font-black uppercase tracking-widest text-slate-400">إقرار الامتثال</h3>
           <p className="text-lg font-medium leading-relaxed opacity-80 max-w-4xl">
             تم استخلاص كافة المؤشرات المذكورة أعلاه من سجلات العمليات التشغيلية والتقارير المالية المعتمدة للمشاريع المحتضنة. تخضع هذه البيانات للمراجعة الدورية لضمان دقة قياس الأثر الاقتصادي والمجتمعي.
           </p>
           <div className="pt-8 flex gap-12">
              <div className="space-y-1">
                 <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">تاريخ الإصدار</p>
                 <p className="text-sm font-bold">١٤ مايو ٢٠٢٤</p>
              </div>
              <div className="space-y-1">
                 <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">جهة التدقيق</p>
                 <p className="text-sm font-bold">لجنة الحوكمة والمخاطر</p>
              </div>
           </div>
        </section>

      </main>

      <footer className="py-12 border-t border-slate-200 text-center bg-white">
        <p className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-300">
          DOCUMENT CLASSIFICATION: OFFICIAL USE ONLY • 2024
        </p>
      </footer>
    </div>
  );
};
