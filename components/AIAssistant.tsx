import React, { useState, useRef, useEffect } from 'react';
import { Mic, MicOff, Send, Sparkles, MessageSquare, Loader2, Volume2, ShieldCheck, Terminal, Bot, User, CheckCircle2 } from 'lucide-react';
import { sendChatMessage, checkGeminiStatus } from '../services/gemini';

const AIAssistant: React.FC = () => {
  const [messages, setMessages] = useState<{ role: 'user' | 'model', text: string }[]>([
    {
      role: 'model',
      text: 'Welcome to the EcoFreight AI Command Center powered by Google Gemini. How can I assist you with route decarbonization, CBAM compliance, or multimodal logistics today?'
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isVoiceActive, setIsVoiceActive] = useState(false);
  const [status, setStatus] = useState<{ active: boolean; model: string }>({ active: true, model: 'gemini-3.8-flash' });
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    checkGeminiStatus().then(s => setStatus({ active: s.active, model: s.model }));
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleQuickAction = (label: string) => {
    let query = "";
    switch(label) {
      case "Check Suez Delays": 
        query = "What is the current status of Suez Canal and Red Sea maritime traffic, and how should we mitigate delays and emissions?"; 
        break;
      case "Emission Summary": 
        query = "Summarize the carbon emission reduction potential across multimodal transport modes (Road vs Rail vs Sea) under the GLEC framework."; 
        break;
      case "Fleet Optimization": 
        query = "What operational strategies can our fleet adopt to minimize fuel consumption and comply with EU CBAM requirements?"; 
        break;
      default: 
        query = label;
    }
    sendMessage(query);
  };

  const sendMessage = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || isLoading) return;

    const userMsg = { role: 'user' as const, text: trimmed };
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setInput('');
    setIsLoading(true);

    try {
      const reply = await sendChatMessage(trimmed, messages);
      setMessages([...updatedMessages, { role: 'model', text: reply }]);
      
      // If voice is active, speak the response
      if (isVoiceActive && 'speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(reply.slice(0, 300));
        utterance.rate = 1.05;
        window.speechSynthesis.speak(utterance);
      }
    } catch (err: any) {
      setMessages([
        ...updatedMessages,
        { role: 'model', text: 'Operational notice: Gemini model response could not be completed. Please verify connection.' }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleVoiceOps = () => {
    if (isVoiceActive) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      setIsVoiceActive(false);
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Voice input is not supported in this browser. Please type your message.");
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsVoiceActive(true);
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          sendMessage(transcript);
        }
      };

      recognition.onerror = (e: any) => {
        console.warn("Speech recognition error:", e);
        setIsVoiceActive(false);
      };

      recognition.onend = () => {
        setIsVoiceActive(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (e) {
      console.error("Failed to start voice ops:", e);
      setIsVoiceActive(false);
    }
  };

  return (
    <div className="h-full flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">AI Command Center</h1>
          <p className="text-slate-500 font-medium">Real-time Multimodal Logistics Intelligence with Google Gemini</p>
        </div>
        <div className="flex items-center gap-2 bg-emerald-50 text-emerald-700 px-4 py-2 rounded-2xl border border-emerald-100 shadow-sm">
          <ShieldCheck size={16} />
          <span className="text-[10px] font-black uppercase tracking-widest">{status.model} Active</span>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-8 min-h-0">
        <div className="lg:col-span-2 flex flex-col bg-white rounded-[3rem] border border-slate-200 shadow-xl shadow-slate-200/50 overflow-hidden">
          <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500 ${isVoiceActive ? 'bg-emerald-500 shadow-lg shadow-emerald-500/40 text-white animate-pulse' : 'bg-emerald-100 text-emerald-700'}`}>
                <Sparkles size={24} />
              </div>
              <div>
                <h3 className="font-bold text-slate-800">Gemini Intelligence Co-Pilot</h3>
                <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest flex items-center gap-1.5 mt-0.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                  Operational
                </p>
              </div>
            </div>
            <button 
              onClick={toggleVoiceOps}
              className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-bold text-sm transition-all active:scale-95 ${isVoiceActive ? 'bg-red-50 text-red-600 hover:bg-red-100 border border-red-200' : 'bg-slate-900 text-white hover:bg-black shadow-lg shadow-slate-900/10'}`}
            >
              {isVoiceActive ? <><MicOff size={18} /> Listening...</> : <><Mic size={18} /> Voice Input</>}
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-8 space-y-6 custom-scrollbar">
            {messages.map((m, i) => (
              <div key={i} className={`flex items-start gap-3 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {m.role === 'model' && (
                  <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-1">
                    <Bot size={18} />
                  </div>
                )}
                <div className={`max-w-[80%] p-5 rounded-[2rem] text-sm font-medium leading-relaxed shadow-sm ${
                  m.role === 'user' 
                    ? 'bg-emerald-600 text-white rounded-tr-none' 
                    : 'bg-slate-50 border border-slate-200/80 text-slate-800 rounded-tl-none whitespace-pre-wrap'
                }`}>
                  {m.text}
                </div>
                {m.role === 'user' && (
                  <div className="w-8 h-8 rounded-xl bg-slate-900 text-white flex items-center justify-center shrink-0 mt-1">
                    <User size={18} />
                  </div>
                )}
              </div>
            ))}

            {isLoading && (
              <div className="flex items-start gap-3 justify-start">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-1">
                  <Bot size={18} />
                </div>
                <div className="bg-slate-50 border border-slate-200/80 p-5 rounded-[2rem] rounded-tl-none flex items-center gap-3 text-slate-600 text-sm">
                  <Loader2 className="animate-spin text-emerald-600" size={18} />
                  <span>Gemini is analyzing multimodal logistics data...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={(e) => { e.preventDefault(); sendMessage(input); }} className="p-6 bg-slate-50 border-t border-slate-100">
             <div className="flex items-center gap-4 bg-white p-2 rounded-[2rem] border border-slate-200 shadow-sm focus-within:ring-2 ring-emerald-500/20 transition-all">
                <input 
                  type="text" 
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask Gemini about multimodal routes, CBAM carbon tariffs, or emissions..." 
                  className="flex-1 bg-transparent px-6 py-2 outline-none text-sm font-medium text-slate-800 placeholder-slate-400" 
                  disabled={isLoading}
                />
                <button 
                  type="submit" 
                  disabled={isLoading || !input.trim()}
                  className="bg-emerald-600 disabled:opacity-50 text-white p-3 rounded-full hover:bg-emerald-700 transition-colors shadow-md shadow-emerald-600/30"
                >
                  <Send size={18} />
                </button>
             </div>
          </form>
        </div>

        <div className="space-y-6">
          <div className="bg-slate-900 rounded-[3rem] p-8 text-white shadow-2xl relative overflow-hidden">
             <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full -mr-16 -mt-16 blur-2xl"></div>
             <h3 className="text-emerald-400 text-[10px] font-black uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
               <Terminal size={14} /> Quick AI Prompts
             </h3>
             <div className="space-y-3">
               <QuickActionButton label="Check Suez Delays" onClick={() => handleQuickAction("Check Suez Delays")} />
               <QuickActionButton label="Emission Summary" onClick={() => handleQuickAction("Emission Summary")} />
               <QuickActionButton label="Fleet Optimization" onClick={() => handleQuickAction("Fleet Optimization")} />
             </div>
          </div>

          <div className="bg-white rounded-[3rem] p-8 border border-slate-200 shadow-sm">
             <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl"><CheckCircle2 size={20} /></div>
                <h4 className="font-extrabold text-slate-800 text-xs uppercase tracking-wider">AI Model Specifications</h4>
             </div>
             <div className="space-y-4">
                <div className="flex justify-between items-center text-xs font-bold text-slate-500">
                  <span>Backend Architecture</span>
                  <span className="text-slate-900 font-mono">Express Full-Stack</span>
                </div>
                <div className="flex justify-between items-center text-xs font-bold text-slate-500">
                  <span>Model Engine</span>
                  <span className="text-emerald-600 font-mono">gemini-3.8-flash</span>
                </div>
                <div className="flex justify-between items-center text-xs font-bold text-slate-500">
                  <span>Standards</span>
                  <span className="text-indigo-600 font-semibold">GLEC & ISO 14083</span>
                </div>
                <div className="flex justify-between items-center text-xs font-bold text-slate-500">
                  <span>Multilingual Support</span>
                  <span className="text-slate-900">EN / EL / TR</span>
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const QuickActionButton = ({ label, onClick }: { label: string, onClick: () => void }) => (
  <button 
    onClick={onClick}
    className="w-full text-left p-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all text-sm font-bold flex justify-between items-center group active:scale-95"
  >
    {label}
    <div className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
      <Send size={12} />
    </div>
  </button>
);

export default AIAssistant;
