
import React, { useState, useRef, useEffect } from 'react';
import { UserProfile, UserRole, Partner, SECTORS } from '../types';
import { storageService } from '../services/storageService';
import { playPositiveSound, playCelebrationSound } from '../services/audioService';

interface ProfileManagementProps {
  user: UserProfile & { uid: string; role: UserRole; startupId?: string };
  isDark: boolean;
}

export const ProfileManagement: React.FC<ProfileManagementProps> = ({ user, isDark }) => {
  const [isSaving, setIsSaving] = useState(false);
  const [profile, setProfile] = useState<UserProfile>({
    firstName: user.firstName || '',
    lastName: user.lastName || '',
    email: user.email || '',
    phone: user.phone || '',
    city: user.city || 'الرياض',
    founderBio: user.founderBio || '',
    startupName: user.startupName || '',
    startupBio: user.startupBio || '',
    industry: user.industry || 'Technology',
    website: user.website || '',
    linkedin: user.linkedin || '',
    logo: user.logo || '',
    partners: user.partners || [],
    skills: user.skills || []
  });

  const [newPartner, setNewPartner] = useState<Partner>({ name: '', role: '' });
  const [skillInput, setSkillInput] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const session = storageService.getCurrentSession();
    if (session) {
      const startups = storageService.getAllStartups();
      const currentStartup = startups.find(s => s.projectId === session.projectId);
      const usersList = storageService.getAllUsers();
      const currentUserRecord = usersList.find(u => u.uid === session.uid);

      if (currentStartup && currentUserRecord) {
        setProfile({
          firstName: currentUserRecord.firstName,
          lastName: currentUserRecord.lastName,
          email: currentUserRecord.email,
          phone: currentUserRecord.phone,
          city: currentUserRecord.city || 'الرياض',
          founderBio: currentUserRecord.founderBio || '',
          startupName: currentStartup.name,
          startupBio: currentStartup.startupBio || '',
          industry: currentStartup.industry,
          website: currentStartup.website || '',
          linkedin: currentStartup.linkedin || '',
          partners: currentStartup.partners || [],
          logo: localStorage.getItem(`logo_${session.uid}`) || undefined,
          skills: currentUserRecord.skills || []
        });
      }
    }
  }, [user.uid]);

  const handleSave = () => {
    setIsSaving(true);
    playPositiveSound();

    setTimeout(() => {
      const session = storageService.getCurrentSession();
      if (session) {
        storageService.updateUser(session.uid, {
          firstName: profile.firstName,
          lastName: profile.lastName,
          phone: profile.phone,
          city: profile.city,
          founderBio: profile.founderBio,
          skills: profile.skills
        });

        storageService.updateStartup(session.projectId!, {
          name: profile.startupName,
          startupBio: profile.startupBio,
          industry: profile.industry,
          website: profile.website,
          linkedin: profile.linkedin,
          partners: profile.partners
        });

        if (profile.logo) {
          localStorage.setItem(`logo_${session.uid}`, profile.logo);
        }
      }
      setIsSaving(false);
      playCelebrationSound();
    }, 1000);
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfile(prev => ({ ...prev, logo: reader.result as string }));
        playPositiveSound();
      };
      reader.readAsDataURL(file);
    }
  };

  const addPartner = () => {
    if (!newPartner.name.trim() || !newPartner.role.trim()) return;
    setProfile(prev => ({
      ...prev,
      partners: [...(prev.partners || []), newPartner]
    }));
    setNewPartner({ name: '', role: '' });
    playPositiveSound();
  };

  const removePartner = (index: number) => {
    setProfile(prev => ({
      ...prev,
      partners: prev.partners?.filter((_, i) => i !== index)
    }));
  };

  const addSkill = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && skillInput.trim()) {
      e.preventDefault();
      if (!profile.skills?.includes(skillInput.trim())) {
        setProfile(prev => ({ ...prev, skills: [...(prev.skills || []), skillInput.trim()] }));
      }
      setSkillInput('');
      playPositiveSound();
    }
  };

  const removeSkill = (skill: string) => {
    setProfile(prev => ({ ...prev, skills: prev.skills?.filter(s => s !== skill) }));
  };

  const inputClass = "w-full p-4 bg-white/5 border border-white/10 rounded-2xl outline-none focus:border-electric-blue transition-all font-bold text-white placeholder-slate-600";
  const labelClass = "block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 pr-2";

  return (
    <div className="max-w-6xl mx-auto space-y-12 animate-fade-up pb-32 text-right" dir="rtl">
      <div className="flex justify-between items-center bg-deep-navy/80 backdrop-blur-xl p-6 rounded-3xl border border-white/5 sticky top-0 z-20 shadow-2xl">
        <div className="flex items-center gap-4">
          <div className="w-2 h-2 bg-saudi-green rounded-full animate-pulse"></div>
          <span className="text-xs font-black text-slate-400 uppercase tracking-widest">التعديلات لم تُحفظ بعد</span>
        </div>
        <button 
          onClick={handleSave}
          disabled={isSaving}
          className="px-12 py-3 bg-electric-blue text-white rounded-xl font-black text-xs uppercase tracking-widest shadow-xl shadow-electric-blue/20 hover:bg-blue-600 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3"
        >
          {isSaving ? (
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
          ) : 'حفظ التغييرات الاستراتيجية'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="space-y-8">
          <div className="glass-card p-10 rounded-[3rem] text-center space-y-8 relative overflow-hidden">
             <div className="absolute top-0 left-0 w-full h-1 bg-electric-blue/30"></div>
             <div 
              className="relative group cursor-pointer w-48 h-48 mx-auto"
              onClick={() => fileInputRef.current?.click()}
             >
                <div className="w-full h-full rounded-[3.5rem] border-4 border-dashed border-white/5 bg-white/5 flex items-center justify-center overflow-hidden transition-all group-hover:border-electric-blue/50">
                  {profile.logo ? (
                    <img 
                      src={profile.logo} 
                      className="w-full h-full object-cover" 
                      alt="Startup Logo" 
                      loading="lazy"
                    />
                  ) : (
                    <span className="text-5xl opacity-20">📁</span>
                  )}
                </div>
                <div className="absolute inset-0 bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 rounded-[3.5rem] transition-opacity font-black text-[10px] uppercase tracking-widest">
                   تغيير الشعار
                </div>
                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleLogoUpload} />
             </div>
             <div className="space-y-1">
                <h3 className="text-xl font-black text-white">{profile.startupName || 'اسم المشروع'}</h3>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Sovereign Entity Logo</p>
             </div>
          </div>

          <div className="glass-card p-10 rounded-[3rem] space-y-8">
             <h4 className="text-sm font-black text-electric-blue uppercase tracking-widest border-b border-white/5 pb-4">معلومات التواصل</h4>
             <div className="space-y-6">
                <div>
                   <label className={labelClass}>رقم الجوال</label>
                   <input className={inputClass} value={profile.phone} onChange={e => setProfile({...profile, phone: e.target.value})} placeholder="05xxxxxxxx" />
                </div>
                <div>
                   <label className={labelClass}>المدينة</label>
                   <input className={inputClass} value={profile.city} onChange={e => setProfile({...profile, city: e.target.value})} placeholder="الرياض، جدة..." />
                </div>
                <div>
                   <label className={labelClass}>رابط LinkedIn الشخصي</label>
                   <input className={inputClass} value={profile.linkedin} onChange={e => setProfile({...profile, linkedin: e.target.value})} placeholder="https://linkedin.com/in/..." />
                </div>
             </div>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-12">
          <section className="glass-card p-12 rounded-[4rem] space-y-10">
             <div className="flex items-center gap-4 border-b border-white/5 pb-8">
                <div className="w-10 h-10 bg-electric-blue/10 text-electric-blue rounded-xl flex items-center justify-center text-xl">🏛️</div>
                <h3 className="text-2xl font-black text-white">الهوية المؤسسية</h3>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                   <label className={labelClass}>اسم الكيان التجاري</label>
                   <input className={inputClass} value={profile.startupName} onChange={e => setProfile({...profile, startupName: e.target.value})} />
                </div>
                <div className="space-y-2">
                   <label className={labelClass}>القطاع الاستراتيجي</label>
                   <select className={inputClass} value={profile.industry} onChange={e => setProfile({...profile, industry: e.target.value})}>
                      {SECTORS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                   </select>
                </div>
                <div className="md:col-span-2 space-y-2">
                   <label className={labelClass}>رؤية المشروع (Mission Statement)</label>
                   <textarea className={inputClass + " h-32 resize-none"} value={profile.startupBio} onChange={e => setProfile({...profile, startupBio: e.target.value})} placeholder="ما هي القيمة الجوهرية التي يقدمها مشروعك؟" />
                </div>
                <div className="space-y-2">
                   <label className={labelClass}>الموقع الإلكتروني</label>
                   <input className={inputClass} value={profile.website} onChange={e => setProfile({...profile, website: e.target.value})} placeholder="www.example.com" />
                </div>
                <div className="space-y-2">
                   <label className={labelClass}>LinkedIn المشروع</label>
                   <input className={inputClass} value={profile.linkedin} onChange={e => setProfile({...profile, linkedin: e.target.value})} placeholder="شركة/..." />
                </div>
             </div>
          </section>

          <section className="glass-card p-12 rounded-[4rem] space-y-10">
             <div className="flex items-center gap-4 border-b border-white/5 pb-8">
                <div className="w-10 h-10 bg-electric-blue/10 text-electric-blue rounded-xl flex items-center justify-center text-xl">👤</div>
                <h3 className="text-2xl font-black text-white">بيانات المؤسس</h3>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                   <label className={labelClass}>الاسم الأول</label>
                   <input className={inputClass} value={profile.firstName} onChange={e => setProfile({...profile, firstName: e.target.value})} />
                </div>
                <div className="space-y-2">
                   <label className={labelClass}>اللقب / العائلة</label>
                   <input className={inputClass} value={profile.lastName} onChange={e => setProfile({...profile, lastName: e.target.value})} />
                </div>
                <div className="md:col-span-2 space-y-2">
                   <label className={labelClass}>النبذة المهنية (Executive Bio)</label>
                   <textarea className={inputClass + " h-32 resize-none"} value={profile.founderBio} onChange={e => setProfile({...profile, founderBio: e.target.value})} placeholder="تحدث عن خبراتك القيادية..." />
                </div>
                <div className="md:col-span-2 space-y-4">
                   <label className={labelClass}>المهارات القيادية والفنية (Skills)</label>
                   <div className="flex flex-wrap gap-2 mb-3">
                      {profile.skills?.map(skill => (
                        <span key={skill} className="px-4 py-2 bg-electric-blue/10 text-electric-blue rounded-xl text-[10px] font-black border border-electric-blue/20 flex items-center gap-3">
                           {skill}
                           <button onClick={() => removeSkill(skill)} className="hover:text-white transition-colors">✕</button>
                        </span>
                      ))}
                   </div>
                   <input 
                    className={inputClass} 
                    placeholder="اكتب مهارة واضغط Enter..." 
                    value={skillInput}
                    onChange={e => setSkillInput(e.target.value)}
                    onKeyDown={addSkill}
                   />
                </div>
             </div>
          </section>

          <section className="glass-card p-12 rounded-[4rem] space-y-10">
             <div className="flex items-center gap-4 border-b border-white/5 pb-8">
                <div className="w-10 h-10 bg-saudi-green/10 text-saudi-green rounded-xl flex items-center justify-center text-xl">👥</div>
                <h3 className="text-2xl font-black text-white">الهيكل التأسيسي (Team)</h3>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                <div className="space-y-6">
                   <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest pr-2">إضافة شريك جديد</p>
                   <div className="space-y-4">
                      <input className={inputClass} placeholder="اسم الشريك" value={newPartner.name} onChange={e => setNewPartner({...newPartner, name: e.target.value})} />
                      <input className={inputClass} placeholder="الدور (مثال: CTO, COO)" value={newPartner.role} onChange={e => setNewPartner({...newPartner, role: e.target.value})} />
                      <button 
                        onClick={addPartner}
                        className="w-full py-4 bg-saudi-green text-white rounded-2xl font-black text-xs hover:bg-emerald-600 transition-all shadow-lg shadow-saudi-green/10 active:scale-95"
                      >
                         إدراج في القائمة
                      </button>
                   </div>
                </div>

                <div className="space-y-4">
                   {profile.partners && profile.partners.length > 0 ? (
                      <div className="space-y-3">
                         {profile.partners.map((p, i) => (
                           <div key={i} className="p-4 bg-white/5 rounded-2xl border border-white/5 flex justify-between items-center group animate-fade-in">
                              <div className="flex items-center gap-4">
                                 <div className="w-10 h-10 rounded-xl bg-electric-blue/10 text-electric-blue flex items-center justify-center font-black text-sm">{p.name.charAt(0)}</div>
                                 <div>
                                    <p className="font-black text-sm text-white">{p.name}</p>
                                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tighter">{p.role}</p>
                                 </div>
                              </div>
                              <button onClick={() => removePartner(i)} className="text-slate-600 hover:text-rose-500 transition-all opacity-0 group-hover:opacity-100 p-2">
                                 <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
                              </button>
                           </div>
                         ))}
                      </div>
                   ) : (
                      <div className="h-full min-h-[150px] border-2 border-dashed border-white/5 rounded-[2.5rem] flex flex-col items-center justify-center opacity-20">
                         <span className="text-4xl mb-2">🤝</span>
                         <p className="text-xs font-black uppercase tracking-widest">لا يوجد شركاء مسجلين</p>
                      </div>
                   )}
                </div>
             </div>
          </section>

          <div className="pt-10 flex justify-center">
             <button 
                onClick={handleSave}
                disabled={isSaving}
                className="px-24 py-8 bg-electric-blue text-white rounded-[2.5rem] font-black text-2xl shadow-3xl shadow-electric-blue/30 hover:bg-blue-600 transition-all active:scale-95 disabled:opacity-50 btn-glow"
             >
                {isSaving ? 'جاري مزامنة البيانات...' : 'حفظ وتأمين الملف الشخصي 🚀'}
             </button>
          </div>

        </div>
      </div>
    </div>
  );
};
