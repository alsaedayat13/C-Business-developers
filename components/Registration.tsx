
import React, { useState, useEffect } from 'react';
import { UserProfile, UserRole, SECTORS } from '../types';
import { playPositiveSound, playCelebrationSound } from '../services/audioService';
import { Logo } from './Branding/Logo';

interface RegistrationProps {
  role?: UserRole;
  onRegister: (profile: UserProfile) => void;
  lang: any;
}

const REG_IMAGES = [
  "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80&w=1200",
  "https://images.unsplash.com/photo-1493246507139-91e8fad9978e?auto=format&fit=crop&q=80&w=1200"
];

export const Registration: React.FC<RegistrationProps> = ({ role = 'STARTUP', onRegister }) => {
  const [step, setStep] = useState(1);
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);
  const [formData, setFormData] = useState<UserProfile>({
    firstName: '', lastName: '', email: '', phone: '', city: '', 
    agreedToTerms: false, startupName: '', startupDescription: '', industry: 'Technology',
    skills: []
  });

  const handleNext = () => { 
    if (step < 3) { setStep(s => s + 1); playPositiveSound(); window.scrollTo({ top: 0, behavior: 'smooth' }); } 
    else { playCelebrationSound(); onRegister(formData); }
  };

  const detectLocation = () => {
    if (!navigator.geolocation) {
      alert("خاصية تحديد الموقع غير مدعومة في متصفحك.");
      return;
    }

    setIsDetectingLocation(true);
    playPositiveSound();
    
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          // Use OpenStreetMap Nominatim for free reverse geocoding
          const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&accept-language=ar`);
          const data = await response.json();
          const city = data.address.city || data.address.town || data.address.state || "موقع مكتشف";
          
          setFormData(prev => ({ ...prev, city }));
          playPositiveSound();
        } catch (error) {
          console.error("Location detection failed", error);
          alert("حدث خطأ أثناء محاولة تحديد الموقع برمجياً.");
        } finally {
          setIsDetectingLocation(false);
        }
      },
      (error) => {
        setIsDetectingLocation(false);
        alert("تعذر الوصول للموقع الجغرافي. يرجى التأكد من تفعيل أذونات الموقع في المتصفح.");
      }
    );
  };

  const inputClass = "w-full p-6 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-electric-blue focus:bg-white focus:ring-4 focus:ring-electric-blue/5 transition-all font-bold text-sm text-slate-900 placeholder-slate-400 shadow-inner";
  const labelClass = "block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 pr-2";

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-[#F8FAFC] font-sans" dir="rtl">
      
      {/* Visual Left Side */}
      <div className="lg:w-[45%] relative hidden lg:flex flex-col justify-between p-24 text-white overflow-hidden bg-slate-950">
        <div className="absolute inset-0 z-0">
          <img 
            src={REG_IMAGES[step % 2]} 
            className="w-full h-full object-cover brightness-[0.2] contrast-[1.1] grayscale transition-all duration-1000" 
            alt="Side View" 
            loading="lazy"
          />
          <div className="absolute inset-0 cinematic-grid opacity-30"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent"></div>
        </div>

        <div className="relative z-10 flex items-center gap-4">
          <Logo variant="light" className="h-10" />
        </div>

        <div className="relative z-10 space-y-8 animate-reveal">
          <h2 className="text-6xl md:text-7xl font-black leading-[1.1] tracking-tighter">
            صمم مستقبلك <br/>
            <span className="text-electric-blue">بمنظور سيادي.</span>
          </h2>
          <p className="text-slate-400 font-medium text-xl max-w-md leading-relaxed">نحن لا نقوم فقط بجمع البيانات، نحن نضع حجر الأساس لكيان تجاري قائم على القيمة والذكاء الاستراتيجي.</p>
        </div>

        <div className="relative z-10 flex gap-5">
          {[1, 2, 3].map(s => (
            <div key={s} className={`h-1.5 rounded-full transition-all duration-700 ${step === s ? 'w-24 bg-electric-blue shadow-glow' : 'w-4 bg-white/20'}`}></div>
          ))}
        </div>
      </div>

      {/* Form Right Side */}
      <main className="flex-1 flex items-center justify-center p-8 md:p-24 relative overflow-y-auto">
        <div className="max-w-xl w-full space-y-16 animate-reveal">
           <header className="space-y-4">
              <div className="inline-flex items-center gap-2 bg-electric-blue/5 text-electric-blue px-5 py-2 rounded-full border border-electric-blue/10">
                 <span className="text-[10px] font-black uppercase tracking-[0.4em]">الخطوة 0{step} • الانضمام</span>
              </div>
              <h3 className="text-5xl font-black text-slate-900 tracking-tighter leading-none">
                {step === 1 && "بيانات المؤسس التنفيذي"}
                {step === 2 && "هوية الكيان التجاري"}
                {step === 3 && "بروتوكول الانضمام"}
              </h3>
           </header>

           <div className="min-h-[450px]">
              {step === 1 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-reveal">
                  <div className="space-y-2"><label className={labelClass}>الاسم الأول</label><input className={inputClass} value={formData.firstName} onChange={e => setFormData({...formData, firstName: e.target.value})} placeholder="الاسم" /></div>
                  <div className="space-y-2"><label className={labelClass}>اللقب / العائلة</label><input className={inputClass} value={formData.lastName} onChange={e => setFormData({...formData, lastName: e.target.value})} placeholder="العائلة" /></div>
                  <div className="md:col-span-2 space-y-2"><label className={labelClass}>البريد الإلكتروني الرسمي</label><input className={inputClass} value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} type="email" placeholder="name@corporate.ai" /></div>
                  <div className="md:col-span-2 space-y-2"><label className={labelClass}>رقم التواصل الموثق</label><input className={inputClass} value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} placeholder="05xxxxxxxx" /></div>
                  
                  {/* City Field with Geolocation UI */}
                  <div className="md:col-span-2 space-y-2 relative">
                    <label className={labelClass}>المدينة / الموقع الجغرافي</label>
                    <div className="relative group/city">
                      <input 
                        className={`${inputClass} pr-16`} 
                        value={formData.city} 
                        onChange={e => setFormData({...formData, city: e.target.value})} 
                        placeholder="أدخل مدينتك (مثال: الرياض)" 
                      />
                      <button 
                        type="button"
                        onClick={detectLocation}
                        disabled={isDetectingLocation}
                        className="absolute right-4 top-1/2 -translate-y-1/2 p-2.5 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all shadow-sm group-hover/city:border-electric-blue active:scale-90 disabled:opacity-50"
                        title="تحديد الموقع تلقائياً"
                      >
                        {isDetectingLocation ? (
                          <div className="w-5 h-5 border-2 border-electric-blue/30 border-t-electric-blue rounded-full animate-spin"></div>
                        ) : (
                          <svg className="w-5 h-5 text-electric-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                          </svg>
                        )}
                      </button>
                    </div>
                    {isDetectingLocation && (
                      <p className="text-[9px] font-bold text-electric-blue animate-pulse mt-2 mr-2">جاري تحديد الإحداثيات الجغرافية...</p>
                    )}
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-10 animate-reveal">
                  <div className="space-y-2"><label className={labelClass}>اسم المشروع / الشركة</label><input className={inputClass} value={formData.startupName} onChange={e => setFormData({...formData, startupName: e.target.value})} placeholder="اسم الكيان التجاري" /></div>
                  <div className="space-y-2">
                    <label className={labelClass}>القطاع الاستراتيجي</label>
                    <select className={inputClass} value={formData.industry} onChange={e => setFormData({...formData, industry: e.target.value})}>
                      {SECTORS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                    </select>
                  </div>
                  <div className="space-y-2"><label className={labelClass}>جوهر القيمة المضافة (Mission)</label><textarea className={inputClass + " h-48 resize-none leading-relaxed"} value={formData.startupDescription} onChange={e => setFormData({...formData, startupDescription: e.target.value})} placeholder="صف الفجوة التي تعالجها في السوق والحل المبتكر الذي تقدمه..." /></div>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-12 animate-reveal">
                   <div className="p-12 bg-white border border-slate-200 rounded-[4rem] shadow-premium space-y-10 relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-electric-blue/5 rounded-bl-[5rem]"></div>
                      <div className="flex items-center gap-6 relative z-10">
                        <div className="w-16 h-16 bg-electric-blue/10 text-electric-blue rounded-[1.8rem] flex items-center justify-center text-3xl shadow-inner border border-electric-blue/20">📜</div>
                        <div>
                           <h4 className="text-2xl font-black text-slate-900">ميثاق الانضمام الذكي</h4>
                           <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-1">Legal & Operational Sync</p>
                        </div>
                      </div>
                      <p className="text-slate-500 font-medium leading-relaxed text-lg italic border-r-4 border-electric-blue/30 pr-8">"بالضغط على إتمام، أنت توافق على بدء مرحلة الفلترة الذكية (AI Screening) ومعالجة بياناتك لبناء مسار الاحتضان المخصص لمشروعك."</p>
                      
                      <label className="flex items-center gap-5 cursor-pointer pt-10 border-t border-slate-100 group relative z-10">
                         <div className={`w-8 h-8 border-2 rounded-xl flex items-center justify-center transition-all ${formData.agreedToTerms ? 'bg-electric-blue border-electric-blue shadow-glow' : 'border-slate-300'}`}>
                           {formData.agreedToTerms && <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={4}><path d="M5 13l4 4L19 7" /></svg>}
                         </div>
                         <input type="checkbox" checked={formData.agreedToTerms} onChange={e => setFormData({...formData, agreedToTerms: e.target.checked})} className="hidden" />
                         <span className="font-black text-sm text-slate-700 group-hover:text-electric-blue transition-colors">أوافق على سياسة الخصوصية وبروتوكول المسرعة.</span>
                      </label>
                   </div>
                </div>
              )}
           </div>

           <div className="flex flex-col md:flex-row gap-6 pt-12 border-t border-slate-200">
              {step > 1 && <button onClick={() => setStep(s => s - 1)} className="px-14 py-6 bg-white text-slate-500 text-[11px] font-black uppercase tracking-widest hover:text-slate-900 hover:border-slate-400 border border-slate-200 rounded-[2rem] transition-all">الرجوع</button>}
              <button 
                onClick={handleNext} 
                disabled={step === 3 && !formData.agreedToTerms}
                className="flex-1 py-6 bg-slate-900 text-white text-[11px] font-black uppercase tracking-[0.3em] shadow-premium hover:bg-electric-blue transition-all active:scale-95 disabled:opacity-20 rounded-[2rem] btn-glow"
              >
                {step === 3 ? "إتمام التأسيس الرقمي" : "المتابعة للخطوة التالية"}
              </button>
           </div>
        </div>
      </main>
    </div>
  );
};
