import React from 'react';
import { GlobalHeader } from './GlobalHeader';
import { GlobalFooter } from './GlobalFooter';
import { Language } from '../../services/i18nService';

interface MainLayoutProps {
  children: React.ReactNode;
  onNavigate: (stage: any) => void;
  onLogin: () => void;
  onStart: () => void;
  lang: Language;
  onLanguageChange: (lang: Language) => void;
}

export const MainLayout: React.FC<MainLayoutProps> = ({ children, onNavigate, onLogin, onStart, lang, onLanguageChange }) => {
  return (
    <div className="min-h-screen flex flex-col bg-white overflow-x-hidden">
      <GlobalHeader 
        onNavigate={onNavigate} 
        onLogin={onLogin} 
        onStart={onStart} 
        lang={lang} 
        onLanguageChange={onLanguageChange}
      />
      
      <main className="flex-1">
        {children}
      </main>
      
      <GlobalFooter lang={lang} />
    </div>
  );
};