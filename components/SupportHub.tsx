
import React, { useState, useEffect } from 'react';
import { SupportTicket, TicketType, UserProfile, UserRole } from '../types';
import { storageService } from '../services/storageService';
import { playPositiveSound, playCelebrationSound } from '../services/audioService';

interface SupportHubProps {
  user: UserProfile & { uid: string; startupId?: string };
}

export const SupportHub: React.FC<SupportHubProps> = ({ user }) => {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    type: 'INQUIRY' as TicketType,
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const userTickets = storageService.getUserTickets(user.uid);
    setTickets(userTickets.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
  }, [user.uid]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.subject || !formData.message) return;

    setIsSubmitting(true);
    playPositiveSound();

    setTimeout(() => {
      const newTicket = storageService.createSupportTicket(
        user.uid,
        user.startupId || '',
        formData.type,
        formData.subject,
        formData.message
      );

      setTickets([newTicket, ...tickets]);
      setFormData({ type: 'INQUIRY', subject: '', message: '' });
      setShowForm(false);
      setIsSubmitting(false);
      playCelebrationSound();
    }, 1000);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING': return <span className="px-3 py-1 bg-slate-50 text-slate-500 rounded-full text-[10px] font-bold border border-slate-200 uppercase tracking-widest">Pending</span>;
      case 'IN_PROGRESS': return <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-[10px] font-bold border border-blue-100 uppercase tracking-widest">In Progress</span>;
      case 'RESOLVED': return <span className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-[10px] font-bold border border-emerald-100 uppercase tracking-widest">Resolved ✓</span>;
      default: return null;
    }
  };

  const getTypeLabel = (type: TicketType) => {
    switch (type) {
      case 'INQUIRY': return 'استفسار عام';
      case 'COMPLAINT': return 'شكوى إدارية';
      case 'SUPPORT': return 'طلب دعم تقني';
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-12 animate-fade-up pb-20">
      <div className="flex flex-col md:flex-row justify-between items-end gap-6 border-b border-slate-100 pb-10">
        <div className="space-y-1">
          <h3 className="text-2xl font-bold text-slate-900 font-heading">مركز المساندة المؤسسي</h3>
          <p className="text-slate-500 text-sm font-medium">قنوات التواصل المباشرة مع الفريق الإداري والاستشاري.</p>
        </div>
        <button 
          onClick={() => setShowForm(!showForm)}
          className="btn-primary"
        >
          {showForm ? 'إلغاء التذكرة' : 'فتح تذكرة جديدة'}
        </button>
      </div>

      {showForm && (
        <div className="bg-white p-10 rounded-xl border border-slate-200 shadow-sm animate-fade-in">
           <form onSubmit={handleSubmit} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                 <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pr-1">نوع الطلب</label>
                    <div className="grid grid-cols-3 gap-2">
                       {(['INQUIRY', 'COMPLAINT', 'SUPPORT'] as TicketType[]).map(type => (
                         <button 
                          key={type}
                          type="button"
                          onClick={() => setFormData({...formData, type})}
                          className={`py-3 rounded-md text-[11px] font-bold border transition-all ${formData.type === type ? 'bg-primary text-white border-primary' : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'}`}
                         >
                            {getTypeLabel(type)}
                         </button>
                       ))}
                    </div>
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pr-1">عنوان الموضوع</label>
                    <input 
                      required
                      className="w-full p-4 bg-slate-50 border border-slate-200 rounded-md outline-none focus:bg-white focus:border-primary transition-all font-bold text-sm text-slate-900"
                      placeholder="مثال: استفسار حول الجولة الاستثمارية..."
                      value={formData.subject}
                      onChange={e => setFormData({...formData, subject: e.target.value})}
                    />
                 </div>
              </div>
              <div className="space-y-2">
                 <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pr-1">تفاصيل الرسالة</label>
                 <textarea 
                    required
                    className="w-full h-40 p-6 bg-slate-50 border border-slate-200 rounded-md outline-none focus:bg-white focus:border-primary transition-all font-medium text-sm text-slate-700 resize-none"
                    placeholder="اشرح طلبك بوضوح وتفصيل ليتمكن الفريق من مساعدتك..."
                    value={formData.message}
                    onChange={e => setFormData({...formData, message: e.target.value})}
                 />
              </div>
              <div className="flex justify-end pt-4">
                 <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="btn-primary px-12"
                 >
                    {isSubmitting ? 'جاري الإرسال...' : 'إرسال التذكرة الرسمية'}
                 </button>
              </div>
           </form>
        </div>
      )}

      <div className="space-y-4">
        {tickets.length > 0 ? (
          tickets.map(ticket => (
            <div key={ticket.id} className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm hover:border-slate-300 transition-all group">
               <div className="flex flex-col md:flex-row justify-between gap-6">
                  <div className="space-y-4 flex-1">
                    <div className="flex items-center gap-4">
                       <span className="text-[9px] font-black text-primary bg-primary/5 px-2 py-0.5 rounded border border-primary/10 uppercase tracking-tighter">
                          {ticket.type}
                       </span>
                       {getStatusBadge(ticket.status)}
                    </div>
                    <div>
                       <h4 className="text-lg font-bold text-slate-900 font-heading mb-2">{ticket.subject}</h4>
                       <p className="text-sm text-slate-500 font-medium leading-relaxed max-w-3xl">{ticket.message}</p>
                    </div>
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                       Reference: {ticket.id} • {new Date(ticket.createdAt).toLocaleDateString('ar-EG')}
                    </div>
                  </div>

                  <div className="shrink-0 flex items-center">
                     {ticket.reply ? (
                       <div className="p-6 bg-slate-50 border border-slate-100 rounded-lg max-w-xs">
                          <p className="text-[9px] font-bold text-primary uppercase tracking-widest mb-2">رد الإدارة الموثق:</p>
                          <p className="text-xs font-bold text-slate-700 leading-relaxed italic">"{ticket.reply}"</p>
                       </div>
                     ) : (
                       <div className="flex items-center gap-2 text-[10px] font-bold text-slate-300 uppercase tracking-widest">
                          <span className="w-1.5 h-1.5 bg-slate-200 rounded-full animate-pulse"></span>
                          بانتظار المراجعة
                       </div>
                     )}
                  </div>
               </div>
            </div>
          ))
        ) : (
          <div className="py-24 bg-slate-50/50 rounded-xl border-2 border-dashed border-slate-200 text-center flex flex-col items-center">
             <div className="text-4xl mb-6 opacity-30">✉️</div>
             <p className="text-lg font-bold text-slate-400 font-heading">لا توجد طلبات مساندة مفتوحة</p>
             <p className="text-xs font-medium text-slate-400 mt-1 uppercase tracking-widest">No active support requests found</p>
          </div>
        )}
      </div>
    </div>
  );
};
