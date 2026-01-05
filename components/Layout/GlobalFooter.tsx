
import React from 'react';
import { Language, getTranslation } from '../../services/i18nService';

interface GlobalFooterProps {
  lang: Language;
}

export const GlobalFooter: React.FC<GlobalFooterProps> = ({ lang }) => {
  const t = getTranslation(lang);
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-slate-50 border-t border-slate-200">
      <div className="max-w-7xl mx-auto px-12 pt-24 pb-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-24 mb-24">
          
          <div className="col-span-1 space-y-6">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-widest">{t.brand}</h4>
            <p className="text-slate-500 text-[11px] leading-relaxed font-medium">
              نظام رائد لبناء وتطوير المشاريع الناشئة بمعايير مؤسسية سيادية، مدعوماً بالذكاء الاصطناعي الاستراتيجي.
            </p>
          </div>

          <div className="space-y-6">
            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Protocol</h4>
            <ul className="space-y-3 text-[11px] font-bold text-slate-600">
              <li className="hover:text-primary cursor-pointer transition-colors">Incubation</li>
              <li className="hover:text-primary cursor-pointer transition-colors">Acceleration</li>
            </ul>
          </div>

          <div className="space-y-6">
            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Governance</h4>
            <ul className="space-y-3 text-[11px] font-bold text-slate-600">
              <li className="hover:text-primary cursor-pointer transition-colors">Privacy Policy</li>
              <li className="hover:text-primary cursor-pointer transition-colors">Terms of Service</li>
            </ul>
          </div>

          <div className="space-y-6">
            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Inquiries</h4>
            <p className="text-[11px] font-bold text-slate-900">Riyadh, Saudi Arabia</p>
            <p className="text-[11px] font-medium text-slate-500 underline underline-offset-4">hq@business-developers.ai</p>
          </div>

        </div>

        <div className="pt-12 border-t border-slate-200 flex flex-col md:flex-row justify-between items-center gap-6 text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em]">
          <p>© {currentYear} Business Developers Hub. All rights reserved.</p>
          <div className="flex gap-8">
            <span>Corporate Edition v2.0</span>
            <span className="text-slate-900">ISO/AI-2030 Compliant</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
