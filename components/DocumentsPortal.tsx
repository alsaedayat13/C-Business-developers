
import React from 'react';
import { UserProfile } from '../types';
import { playPositiveSound } from '../services/audioService';

interface DocumentsPortalProps {
  user: UserProfile;
  progress: number;
  onShowCertificate: () => void;
}

export const DocumentsPortal: React.FC<DocumentsPortalProps> = ({ user, progress, onShowCertificate }) => {
  const isCompleted = progress >= 100;

  const handleDownloadPDF = (docName: string) => {
    playPositiveSound();
    alert(`جاري تجهيز نسخة PDF من ${docName}...`);
    window.print(); 
  };

  return (
    <div className="max-w-5xl mx-auto space-y-12 animate-fade-up pb-20">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* 1. Incubation Contract */}
        <div className="bg-white p-10 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between group hover:border-primary transition-all">
          <div className="space-y-8">
            <div className="flex justify-between items-start">
              <span className="text-3xl grayscale group-hover:grayscale-0 transition-all duration-500">📄</span>
              <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100 uppercase tracking-widest">Active</span>
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900 font-heading mb-2">عقد الاحتضان</h3>
              <p className="text-slate-500 text-sm font-medium leading-relaxed">اتفاقية تقديم خدمات التسريع الرقمية المعتمدة للكيان المؤسسي.</p>
            </div>
            <div className="p-4 bg-slate-50 rounded-lg border border-slate-100">
               <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Status</p>
               <p className="text-xs font-bold text-slate-700">موقع رقمياً • {new Date().toLocaleDateString('ar-EG')}</p>
            </div>
          </div>
          <button 
            onClick={() => handleDownloadPDF('عقد الاحتضان')}
            className="btn-secondary w-full mt-10 flex items-center justify-center gap-2 group-hover:bg-slate-50"
          >
            <span>تحميل النسخة PDF</span>
          </button>
        </div>

        {/* 2. MISA Support Letter */}
        <div className="bg-white p-10 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between group hover:border-primary transition-all">
          <div className="space-y-8">
            <div className="flex justify-between items-start">
              <span className="text-3xl grayscale group-hover:grayscale-0 transition-all duration-500">🏛️</span>
              <span className="text-[10px] font-bold text-primary bg-primary/5 px-2 py-0.5 rounded border border-primary/10 uppercase tracking-widest">MISA Protocol</span>
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900 font-heading mb-2">خطاب دعم الاستثمار</h3>
              <p className="text-slate-500 text-sm font-medium leading-relaxed">توصية رسمية موجهة لوزارة الاستثمار لتسهيل الإجراءات التنظيمية.</p>
            </div>
            <div className="p-4 bg-slate-50 rounded-lg border border-slate-100">
               <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Impact Level</p>
               <p className="text-xs font-bold text-slate-700">اعتماد استراتيجي كامل</p>
            </div>
          </div>
          <button 
            onClick={() => handleDownloadPDF('خطاب دعم الاستثمار')}
            className="btn-secondary w-full mt-10 flex items-center justify-center gap-2 group-hover:bg-slate-50"
          >
            <span>طلب الرخصة</span>
          </button>
        </div>

        {/* 3. Program Completion Certificate */}
        <div className={`p-10 rounded-xl border flex flex-col justify-between group transition-all
          ${isCompleted ? 'bg-white border-slate-200 shadow-sm hover:border-primary' : 'bg-slate-50 border-transparent opacity-60'}
        `}>
          <div className="space-y-8">
            <div className="flex justify-between items-start">
              <span className="text-3xl grayscale group-hover:grayscale-0 transition-all duration-500">🎓</span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase tracking-widest ${isCompleted ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-slate-200 text-slate-400 border-slate-300'}`}>
                {isCompleted ? 'Released' : 'Pending'}
              </span>
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900 font-heading mb-2">شهادة إتمام البرنامج</h3>
              <p className="text-slate-500 text-sm font-medium leading-relaxed">شهادة تخرج معتمدة تُمنح بعد استيفاء كافة مخرجات خارطة الطريق.</p>
            </div>
            {!isCompleted && (
              <div className="space-y-2">
                 <div className="flex justify-between text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                    <span>Maturity Progress</span>
                    <span>{Math.round(progress)}%</span>
                 </div>
                 <div className="w-full bg-slate-200 h-1 rounded-full overflow-hidden">
                    <div className="bg-primary h-full transition-all duration-1000" style={{ width: `${progress}%` }}></div>
                 </div>
              </div>
            )}
          </div>
          <button 
            disabled={!isCompleted}
            onClick={onShowCertificate}
            className={`w-full mt-10 py-3 rounded-md font-bold text-xs transition-all uppercase tracking-widest
              ${isCompleted ? 'bg-primary text-white shadow-lg shadow-primary/20 hover:bg-blue-700' : 'bg-slate-200 text-slate-400 cursor-not-allowed'}
            `}
          >
            عرض الشهادة الرسمية
          </button>
        </div>

      </div>
    </div>
  );
};
