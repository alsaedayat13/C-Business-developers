
import React, { useState, useEffect } from 'react';
import { storageService } from '../services/storageService';
import { UserProfile, UserRole } from '../types';
import { playPositiveSound, playErrorSound } from '../services/audioService';
import { Language, getTranslation } from '../services/i18nService';
import { Logo } from './Branding/Logo';

interface LoginProps {
  onLoginSuccess: (user: UserProfile & { role: UserRole; uid: string; startupId?: string }) => void;
  onBack: () => void;
  lang: Language;
}

export const Login: React.FC<LoginProps> = ({ onLoginSuccess, onBack, lang }) => {
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState(''); 
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const t = getTranslation(lang);

  useEffect(() => {
    storageService.seedDemoAccounts();
  }, []);

  const rolesConfig: { id: UserRole; title: string; icon: string; desc: string }[] = [
    { id: 'STARTUP', title: 'شركة محتضنة', icon: '🚀', desc: 'مؤسس مشروع يبحث عن التسريع' },
    { id: 'PARTNER', title: 'شريك استراتيجي', icon: '🤝', desc: 'خبير يبحث عن فرص تأسيس مشترك' },
    { id: 'MENTOR', title: 'مرشد أعمال', icon: '🎓', desc: 'خبير يقدم التوجيه والتدقيق' },
    { id: 'ADMIN', title: 'الإدارة', icon: '🏛️', desc: 'إدارة المنصة والتحليل المركزي' },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError(lang === 'ar' ? 'يرجى إدخال البريد الإلكتروني' : 'Please enter your email');
      return;
    }
    setIsLoading(true);
    setError(null);

    // محاكاة التحقق من البيانات
    setTimeout(() => {
      const result = storageService.loginUser(email);
      if (result) {
        const profile: any = {
          ...result.user,
          startupName: result.startup?.name || '',
          startupId: result.startup?.projectId,
          name: `${result.user.firstName} ${result.user.lastName}`,
        };
        playPositiveSound();
        onLoginSuccess(profile);
      } else {
        setError(t.auth.error_not_found);
        playErrorSound();
      }
      setIsLoading(false);
    }, 800);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white p-6 md:p-12 font-sans" dir="rtl">
      <div className="max-w-4xl w-full space-y-16 animate-fade-in">
        
        {/* Header Section */}
        <div className="flex flex-col items-center text-center space-y-6">
           <Logo className="h-12" />
           <div className="space-y-2">
              <h2 className="text-[32px] font-bold text-slate-900 leading-tight font-heading">مرحباً بك في مركز القيادة</h2>
              <p className="text-slate-500 text-lg font-medium">اختر هويتك للوصول إلى أدواتك المخصصة</p>
           </div>
        </div>

        {!selectedRole ? (
          /* Role Selection Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-up">
            {rolesConfig.map((role) => (
              <button
                key={role.id}
                onClick={() => { setSelectedRole(role.id); playPositiveSound(); }}
                className="group p-8 border border-slate-100 rounded-xl text-right transition-all hover:border-primary hover:bg-slate-50 flex items-start gap-6"
              >
                <div className="w-14 h-14 bg-slate-50 rounded-lg flex items-center justify-center text-3xl group-hover:bg-white transition-colors border border-transparent group-hover:border-slate-100">
                  {role.icon}
                </div>
                <div className="space-y-1">
                  <h3 className="text-xl font-bold text-slate-900 font-heading">{role.title}</h3>
                  <p className="text-sm text-slate-500 font-medium">{role.desc}</p>
                </div>
              </button>
            ))}
          </div>
        ) : (
          /* Login Form */
          <div className="max-w-md mx-auto w-full space-y-8 animate-fade-in-up">
            <div className="flex justify-between items-center mb-4">
               <button 
                 onClick={() => setSelectedRole(null)} 
                 className="text-xs font-bold text-slate-400 hover:text-slate-900 transition-colors flex items-center gap-2"
               >
                 <span>→</span> تغيير الدور
               </button>
               <span className="px-4 py-1 bg-slate-100 rounded-full text-[10px] font-black uppercase tracking-widest text-slate-600 border border-slate-200">
                 {rolesConfig.find(r => r.id === selectedRole)?.title}
               </span>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pr-1">البريد الإلكتروني الرسمي</label>
                  <input 
                    type="email" 
                    required
                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:border-primary outline-none transition-all font-bold text-slate-900 placeholder-slate-400"
                    placeholder="name@corporate.ai"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pr-1">كلمة المرور</label>
                  <input 
                    type="password" 
                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:border-primary outline-none transition-all font-bold text-slate-900 placeholder-slate-400"
                    placeholder="••••••••"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                  />
                </div>
              </div>

              {error && <div className="text-rose-600 text-xs font-bold text-center bg-rose-50 p-3 rounded-lg border border-rose-100">⚠️ {error}</div>}

              <button 
                type="submit" 
                disabled={isLoading}
                className="btn-primary w-full py-5 text-sm uppercase tracking-[0.1em] shadow-lg shadow-primary/20"
              >
                {isLoading ? 'جاري التحقق من الهوية...' : 'دخول المنصة الآمنة'}
              </button>
            </form>
          </div>
        )}

        {/* Footer Links */}
        <div className="pt-12 border-t border-slate-50 flex flex-col items-center gap-6">
           <button 
             onClick={onBack} 
             className="text-[11px] font-bold text-slate-400 hover:text-slate-900 uppercase tracking-widest transition-colors"
           >
             العودة للصفحة الرئيسية
           </button>
           <p className="text-[8px] text-slate-300 font-bold uppercase tracking-[0.3em]">Institutional Secure Gateway • v2.8.5</p>
        </div>

      </div>
    </div>
  );
};
