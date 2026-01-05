
import React, { useState, useRef, useEffect } from 'react';
import { getCustomMentorResponseAI } from '../../services/geminiService';
import { playPositiveSound } from '../../services/audioService';

const PERSONAS = [
  { id: 'expert', label: 'مستشار خبير', icon: '👔', desc: 'تركيز على الأرقام، الاستراتيجية، والجدوى.' },
  { id: 'coach', label: 'مدرب محفز', icon: '✨', desc: 'دعم معنوي، تشجيع، وخطوات تدريجية.' },
  { id: 'critic', label: 'محلل صريح', icon: '⚖️', desc: 'كشف نقاط الضعف، المخاطر، والواقعية القاسية.' }
];

const STYLES = [
  { id: 'formal', label: 'رسمي', icon: '🏛️', desc: 'لغة مؤسسية دقيقة' },
  { id: 'friendly', label: 'ودي', icon: '🤝', desc: 'نقاش مريح وتلقائي' },
  { id: 'concise', label: 'مختصر', icon: '⚡', desc: 'إجابات مباشرة وسريعة' }
];

export const QuickSupportChat: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isConfigured, setIsConfigured] = useState(false);
  const [selectedPersona, setSelectedPersona] = useState(PERSONAS[0]);
  const [selectedStyle, setSelectedStyle] = useState(STYLES[0]);
  
  const [messages, setMessages] = useState<{ role: 'user' | 'ai', text: string }[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading, isConfigured]);

  const handleStartSession = () => {
    setIsConfigured(true);
    playPositiveSound();
  };

  const handleSend = async () => {
    if (!input.trim() || loading) return;
    
    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setLoading(true);
    playPositiveSound();

    try {
      const aiResponse = await getCustomMentorResponseAI(userMsg, selectedPersona.label, selectedStyle.label);
      setMessages(prev => [...prev, { role: 'ai', text: aiResponse || "عذراً، لم أستطع فهم ذلك." }]);
    } catch (e) {
      setMessages(prev => [...prev, { role: 'ai', text: "عذراً، حدث خطأ تقني. يرجى المحاولة لاحقاً." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-8 left-8 z-[200]" dir="rtl">
      {/* Chat Window */}
      {isOpen && (
        <div className="absolute bottom-24 left-0 w-[420px] bg-white rounded-[2.5rem] shadow-3xl border border-slate-100 overflow-hidden flex flex-col animate-fade-in-up origin-bottom-left max-h-[650px]">
          
          {/* Header */}
          <div className="p-8 bg-slate-950 text-white flex justify-between items-center shrink-0">
             <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white font-black shadow-xl transition-transform hover:rotate-6">
                  {isConfigured ? selectedPersona.icon : '🤖'}
                </div>
                <div>
                   <p className="text-sm font-black leading-none">{isConfigured ? selectedPersona.label : 'تخصيص الموجه الذكي'}</p>
                   <p className="text-[9px] font-bold text-blue-400 uppercase tracking-widest mt-1">
                    {isConfigured ? `أسلوب: ${selectedStyle.label}` : 'إعداد جلسة الإرشاد'}
                   </p>
                </div>
             </div>
             <button onClick={() => setIsOpen(false)} className="text-white/40 hover:text-white transition-colors p-2 text-xl font-black">✕</button>
          </div>

          {!isConfigured ? (
            /* Setup Screen */
            <div className="flex-1 overflow-y-auto p-10 space-y-10 bg-white">
               <div className="space-y-4">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] pr-2">اختر شخصية الموجه:</label>
                  <div className="grid grid-cols-1 gap-3">
                     {PERSONAS.map(p => (
                       <button 
                        key={p.id}
                        onClick={() => { setSelectedPersona(p); playPositiveSound(); }}
                        className={`flex items-center gap-4 p-4 rounded-2xl border-2 transition-all text-right group
                          ${selectedPersona.id === p.id ? 'bg-blue-50 border-blue-600 shadow-sm' : 'bg-slate-50 border-transparent hover:border-slate-200'}
                        `}
                       >
                          <span className="text-3xl transition-transform group-hover:scale-110">{p.icon}</span>
                          <div>
                             <p className={`text-sm font-black ${selectedPersona.id === p.id ? 'text-blue-700' : 'text-slate-900'}`}>{p.label}</p>
                             <p className="text-[10px] font-bold text-slate-500 leading-relaxed">{p.desc}</p>
                          </div>
                       </button>
                     ))}
                  </div>
               </div>

               <div className="space-y-4">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] pr-2">اختر أسلوب الرد:</label>
                  <div className="grid grid-cols-3 gap-3">
                     {STYLES.map(s => (
                       <button 
                        key={s.id}
                        onClick={() => { setSelectedStyle(s); playPositiveSound(); }}
                        className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all group
                          ${selectedStyle.id === s.id ? 'bg-blue-50 border-blue-600 text-blue-600 shadow-sm' : 'bg-slate-50 border-transparent text-slate-500 hover:border-slate-200'}
                        `}
                       >
                          <span className="text-xl group-hover:scale-110">{s.icon}</span>
                          <span className="text-[11px] font-black">{s.label}</span>
                       </button>
                     ))}
                  </div>
               </div>

               <button 
                onClick={handleStartSession}
                className="w-full py-5 bg-blue-600 text-white rounded-[1.8rem] font-black text-sm shadow-xl shadow-blue-500/20 hover:bg-blue-700 transition-all active:scale-95"
               >
                 بدء جلسة الإرشاد
               </button>
            </div>
          ) : (
            /* Chat Interface */
            <>
              <div ref={scrollRef} className="flex-1 overflow-y-auto p-8 space-y-8 bg-slate-50/50">
                 {messages.length === 0 && (
                   <div className="text-center py-10 space-y-4 animate-fade-in">
                      <span className="text-5xl block animate-bounce">{selectedPersona.icon}</span>
                      <div className="space-y-1">
                        <p className="text-base font-black text-slate-900">مرحباً بك في جلسة الإرشاد</p>
                        <p className="text-xs font-medium text-slate-500">سأقوم بدور {selectedPersona.label} لخدمة مشروعك.</p>
                      </div>
                   </div>
                 )}
                 {messages.map((m, i) => (
                   <div key={i} className={`flex ${m.role === 'user' ? 'justify-start' : 'justify-end'} animate-fade-in`}>
                      <div className={`max-w-[85%] p-5 text-sm font-bold leading-relaxed shadow-sm
                        ${m.role === 'user' 
                          ? 'bg-blue-600 text-white rounded-[1.5rem] rounded-br-none shadow-md' 
                          : 'bg-white text-slate-800 border border-slate-100 rounded-[1.5rem] rounded-bl-none'}
                      `}>
                        {m.text}
                      </div>
                   </div>
                 ))}
                 {loading && (
                   <div className="flex justify-end animate-fade-in">
                      <div className="bg-white p-5 rounded-[1.5rem] shadow-sm border border-slate-100 space-x-2 space-x-reverse flex items-center">
                        <div className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce"></div>
                        <div className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce delay-100"></div>
                        <div className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce delay-200"></div>
                      </div>
                   </div>
                 )}
              </div>

              <div className="p-6 bg-white border-t border-slate-100 shrink-0">
                 <div className="relative group">
                    <input 
                      className="w-full pl-14 pr-6 py-5 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-blue-600 focus:bg-white transition-all text-sm font-bold shadow-inner"
                      placeholder="اطرح تساؤلك الاستراتيجي هنا..."
                      value={input}
                      onChange={e => setInput(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && handleSend()}
                    />
                    <button 
                      onClick={handleSend}
                      disabled={!input.trim() || loading}
                      className="absolute left-3 top-3 bottom-3 aspect-square bg-blue-600 text-white rounded-xl flex items-center justify-center hover:bg-blue-700 transition-all disabled:opacity-30 active:scale-90 shadow-lg"
                    >
                      <svg className="w-5 h-5 transform rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    </button>
                 </div>
                 <div className="mt-4 flex justify-between items-center px-2">
                    <button onClick={() => setIsConfigured(false)} className="text-[9px] font-black text-slate-400 hover:text-blue-600 uppercase tracking-widest transition-colors flex items-center gap-1">
                      <span>⚙️</span> تغيير الشخصية
                    </button>
                    <p className="text-[8px] font-bold text-slate-300 uppercase tracking-widest">Enterprise AI Intelligence Core</p>
                 </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* Floating Button */}
      <button 
        onClick={() => { setIsOpen(!isOpen); playPositiveSound(); }}
        className={`w-20 h-20 bg-slate-950 text-white rounded-[2.2rem] shadow-3xl flex items-center justify-center transition-all duration-500 hover:scale-105 active:scale-95 border-4 border-white group relative ${isOpen ? 'rotate-90 bg-blue-600' : ''}`}
      >
        {isOpen ? (
          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path d="M6 18L18 6M6 6l12 12" /></svg>
        ) : (
          <div className="relative">
             <div className="absolute inset-0 bg-blue-500/20 rounded-full blur-[20px] scale-150 animate-pulse"></div>
             <svg className="w-9 h-9 relative z-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
               <path d="M8 10h.01M12 10h.01M16 10h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
             </svg>
          </div>
        )}
        
        {/* Tooltip on Hover when closed */}
        {!isOpen && (
          <div className="absolute right-full mr-6 px-4 py-2 bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest rounded-xl opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none shadow-2xl border border-white/5">
             الموجه الاستراتيجي
          </div>
        )}
      </button>
    </div>
  );
};
