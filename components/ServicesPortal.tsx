
import React, { useState, useEffect } from 'react';
import { SERVICES_CATALOG, ServiceItem, ServicePackage, ServiceRequest, UserRole, UserProfile } from '../types';
import { storageService } from '../services/storageService';
import { playPositiveSound, playCelebrationSound } from '../services/audioService';

interface ServicesPortalProps {
  user: UserProfile & { uid: string; startupId?: string };
}

export const ServicesPortal: React.FC<ServicesPortalProps> = ({ user }) => {
  const [activeView, setActiveView] = useState<'catalog' | 'my_requests'>('catalog');
  const [selectedService, setSelectedService] = useState<ServiceItem | null>(null);
  const [selectedPackageId, setSelectedPackageId] = useState<string | null>(null);
  const [details, setDetails] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userRequests, setUserRequests] = useState<ServiceRequest[]>([]);

  useEffect(() => {
    setUserRequests(storageService.getUserServiceRequests(user.uid));
  }, [user.uid, activeView]);

  const handleRequestSubmit = () => {
    if (!selectedService || !selectedPackageId) return;
    
    setIsSubmitting(true);
    playPositiveSound();

    setTimeout(() => {
      storageService.requestService(user.uid, selectedService.id, selectedPackageId, details);
      playCelebrationSound();
      setIsSubmitting(false);
      setSelectedService(null);
      setSelectedPackageId(null);
      setDetails('');
      setActiveView('my_requests');
    }, 1500);
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'PENDING': return 'قيد المراجعة';
      case 'IN_PROGRESS': return 'جاري التنفيذ';
      case 'COMPLETED': return 'مكتمل ✓';
      default: return status;
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-12 animate-fade-up" dir="rtl">
      {/* View Switcher */}
      <div className="flex bg-slate-100 p-1.5 rounded-2xl w-fit mx-auto border border-slate-200">
         <button 
           onClick={() => { setActiveView('catalog'); playPositiveSound(); }}
           className={`px-10 py-3 rounded-xl text-xs font-black transition-all ${activeView === 'catalog' ? 'bg-white text-blue-600 shadow-md' : 'text-slate-500 hover:text-slate-700'}`}
         >
           دليل الخدمات
         </button>
         <button 
           onClick={() => { setActiveView('my_requests'); playPositiveSound(); }}
           className={`px-10 py-3 rounded-xl text-xs font-black transition-all ${activeView === 'my_requests' ? 'bg-white text-blue-600 shadow-md' : 'text-slate-500 hover:text-slate-700'}`}
         >
           طلباتي ({userRequests.length})
         </button>
      </div>

      {activeView === 'catalog' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
           {SERVICES_CATALOG.map(service => (
             <div key={service.id} className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm flex flex-col justify-between group hover:border-blue-600 transition-all card-premium">
                <div>
                   <div className="w-20 h-20 bg-slate-50 rounded-[2rem] flex items-center justify-center text-5xl mb-8 shadow-inner group-hover:scale-110 transition-transform">
                      {service.icon}
                   </div>
                   <h3 className="text-2xl font-black text-slate-900 mb-4 flex items-center gap-2">
                     {service.title}
                     <span className="text-sm opacity-30 group-hover:opacity-100 transition-opacity">🌟</span>
                   </h3>
                   <p className="text-sm text-slate-500 font-medium leading-relaxed mb-10">{service.description}</p>
                </div>
                <button 
                  onClick={() => { setSelectedService(service); playPositiveSound(); }}
                  className="w-full py-5 bg-slate-900 text-white rounded-2xl font-black text-sm hover:bg-blue-600 transition-all active:scale-95 shadow-lg"
                >
                   اكتشف الباقات
                </button>
             </div>
           ))}
        </div>
      )}

      {activeView === 'my_requests' && (
        <div className="space-y-6">
           {userRequests.length > 0 ? userRequests.map(req => {
             const svc = SERVICES_CATALOG.find(s => s.id === req.serviceId);
             const pkg = svc?.packages.find(p => p.id === req.packageId);
             return (
               <div key={req.id} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col md:flex-row justify-between items-center gap-6">
                  <div className="flex items-center gap-6 flex-1">
                     <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-3xl shadow-inner">
                        {svc?.icon}
                     </div>
                     <div>
                        <h4 className="text-xl font-black text-slate-900">{svc?.title} - {pkg?.name}</h4>
                        <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">تاريخ الطلب: {new Date(req.createdAt).toLocaleDateString('ar-EG')}</p>
                     </div>
                  </div>
                  <div className="flex items-center gap-6">
                     <span className={`px-5 py-2 rounded-full text-[10px] font-black border uppercase
                        ${req.status === 'COMPLETED' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-blue-50 text-blue-600 border-blue-100'}
                     `}>
                        {getStatusLabel(req.status)}
                     </span>
                     <button className="text-slate-300 hover:text-blue-600 font-black text-xs uppercase tracking-widest">التفاصيل</button>
                  </div>
               </div>
             );
           }) : (
             <div className="py-24 text-center bg-white rounded-[4rem] border-2 border-dashed border-slate-100 opacity-40">
                <div className="text-7xl mb-6">🛠️</div>
                <h3 className="text-2xl font-black text-slate-900">لم تطلب أي خدمات بعد</h3>
                <p className="max-w-xs mx-auto mt-4 font-medium">دليل الخدمات يضم نخبة من الخبراء التقنيين والاستراتيجيين لمساعدتك.</p>
             </div>
           )}
        </div>
      )}

      {/* Service Selection Modal */}
      {selectedService && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-2xl animate-fade-in">
           <div className="bg-white rounded-[4rem] w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-3xl border border-slate-100 animate-fade-in-up">
              <div className="p-12 md:p-16">
                 <div className="flex justify-between items-start mb-14">
                    <div className="flex items-center gap-6">
                       <div className="w-20 h-20 bg-blue-50 rounded-[2.2rem] flex items-center justify-center text-4xl shadow-inner text-blue-600">
                          {selectedService.icon}
                       </div>
                       <div>
                          <h3 className="text-4xl font-black text-slate-900 tracking-tighter">{selectedService.title}</h3>
                          <p className="text-blue-600 font-black text-xs uppercase tracking-[0.2em] mt-2">Executive Service Configuration</p>
                       </div>
                    </div>
                    <button onClick={() => setSelectedService(null)} className="p-4 hover:bg-slate-50 rounded-2xl transition-all font-black text-slate-400">✕</button>
                 </div>

                 <div className="space-y-12">
                    <div className="space-y-6">
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] pr-2">اختر الباقة المناسبة لمشروعك:</p>
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {selectedService.packages.map(pkg => (
                            <button 
                              key={pkg.id}
                              onClick={() => { setSelectedPackageId(pkg.id); playPositiveSound(); }}
                              className={`p-8 rounded-[2.5rem] border-4 text-right transition-all group relative
                                ${selectedPackageId === pkg.id 
                                  ? 'bg-blue-600 border-blue-600 text-white shadow-2xl shadow-blue-500/20' 
                                  : 'bg-slate-50 border-slate-100 hover:border-blue-500/30'}
                              `}
                            >
                               <div className="flex justify-between items-start mb-6">
                                  <h4 className="text-2xl font-black">{pkg.name}</h4>
                                  <span className={`text-xl font-black ${selectedPackageId === pkg.id ? 'text-white' : 'text-blue-600'}`}>{pkg.price}</span>
                               </div>
                               <ul className="space-y-3 mb-4">
                                  {pkg.features.map((f, i) => (
                                    <li key={i} className={`text-xs font-bold flex items-center gap-3 ${selectedPackageId === pkg.id ? 'text-blue-50' : 'text-slate-500'}`}>
                                       <span className={`w-1 h-1 rounded-full ${selectedPackageId === pkg.id ? 'bg-white' : 'bg-blue-500'}`}></span>
                                       {f}
                                    </li>
                                  ))}
                               </ul>
                               {selectedPackageId === pkg.id && (
                                 <div className="absolute -top-3 -right-3 w-10 h-10 bg-white text-blue-600 rounded-full flex items-center justify-center shadow-lg animate-fade-in border-4 border-blue-600">✓</div>
                               )}
                            </button>
                          ))}
                       </div>
                    </div>

                    <div className="space-y-4">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] pr-2 block">متطلبات مخصصة أو تفاصيل إضافية:</label>
                       <textarea 
                         className="w-full h-40 p-8 bg-slate-50 border border-slate-200 rounded-[2.5rem] outline-none focus:bg-white focus:border-blue-500 transition-all font-medium text-lg shadow-inner resize-none leading-relaxed"
                         placeholder="اشرح لنا أي تفاصيل تقنية أو فنية تود إضافتها لمشروعك..."
                         value={details}
                         onChange={e => setDetails(e.target.value)}
                       />
                    </div>

                    <div className="pt-8 flex flex-col md:flex-row gap-6 border-t border-slate-100">
                       <button onClick={() => setSelectedService(null)} className="flex-1 py-6 bg-slate-100 text-slate-500 rounded-[2rem] font-black text-lg hover:bg-slate-200 transition-all">إلغاء الطلب</button>
                       <button 
                        onClick={handleRequestSubmit}
                        disabled={!selectedPackageId || isSubmitting}
                        className="flex-[2] py-6 bg-blue-600 text-white rounded-[2rem] font-black text-xl shadow-3xl shadow-blue-500/20 active:scale-95 disabled:opacity-30 transition-all flex items-center justify-center gap-4"
                       >
                         {isSubmitting ? (
                           <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
                         ) : (
                           <>
                             <span>تأكيد وإرسال طلب التنفيذ</span>
                             <span className="text-2xl">🚀</span>
                           </>
                         )}
                       </button>
                    </div>
                 </div>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};
