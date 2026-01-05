
import React, { useState, useEffect } from 'react';
import { Language, getTranslation } from '../../services/i18nService';
import { Logo } from '../Branding/Logo';

interface GlobalHeaderProps {
  onNavigate: (stage: any) => void;
  onLogin: () => void;
  onStart: () => void;
  lang: Language;
  onLanguageChange: (lang: Language) => void;
}

export const GlobalHeader: React.FC<GlobalHeaderProps> = ({ onNavigate, onLogin, onStart, lang, onLanguageChange }) => {
  const [scrolled, setScrolled] = useState(false);
  const t = getTranslation(lang);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 40);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav 
      className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-300 px-8 md:px-12 ${
        scrolled 
        ? 'py-4 bg-white border-b border-slate-100 shadow-sm' 
        : 'py-8 bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        
        {/* Right-aligned Navigation & Actions (Flows from Right to Left in RTL) */}
        <div className="flex items-center gap-10">
          
          {/* Far Right: Primary CTA */}
          <button 
            onClick={onStart} 
            className="bg-primary text-white px-8 py-3 rounded-md text-[11px] font-bold uppercase tracking-widest hover:bg-blue-700 transition-all active:scale-95 shadow-lg shadow-primary/20"
          >
            {t.nav.start}
          </button>

          {/* Login Action */}
          <button 
            onClick={onLogin} 
            className="text-[11px] font-bold text-slate-900 hover:text-primary uppercase tracking-widest transition-colors"
          >
            {t.nav.login}
          </button>

          {/* Navigation Links Group */}
          <div className="hidden lg:flex items-center gap-8 text-[11px] font-bold text-slate-500 uppercase tracking-[0.2em]">
            <button 
              onClick={() => onNavigate('CONTACT')}
              className="hover:text-slate-900 transition-colors border-b-2 border-transparent hover:border-primary pb-1"
            >
              {t.nav.contact}
            </button>
            <button 
              onClick={() => onNavigate('PARTNER_CONCEPT')}
              className="hover:text-slate-900 transition-colors border-b-2 border-transparent hover:border-primary pb-1"
            >
              الشركاء
            </button>
            <button 
              onClick={() => onNavigate('INCUBATION_PROGRAM')}
              className="hover:text-slate-900 transition-colors border-b-2 border-transparent hover:border-primary pb-1"
            >
              البرامج
            </button>
            <button 
              onClick={() => onNavigate('LANDING')}
              className="hover:text-slate-900 transition-colors border-b-2 border-transparent hover:border-primary pb-1"
            >
              الرئيسية
            </button>
          </div>
        </div>

        {/* Far Left: Logo */}
        <div 
          className="cursor-pointer transition-transform hover:scale-105" 
          onClick={() => onNavigate('LANDING')}
        >
          <Logo variant="dark" className="h-8" />
        </div>

      </div>
    </nav>
  );
};
