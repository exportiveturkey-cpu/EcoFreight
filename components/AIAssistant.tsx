
import React, { useState, useRef } from 'react';
import { GoogleGenAI, Modality, LiveServerMessage } from '@google/genai';
import { Mic, MicOff, Send, Sparkles, MessageSquare, Loader2, Volume2, ShieldCheck, Terminal } from 'lucide-react';

const AIAssistant: React.FC = () => {
  const [isLive, setIsLive] = useState(false);
  const [messages, setMessages] = useState<{ role: 'user' | 'model', text: string }[]>([]);
  const [input, setInput] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const sessionRef = useRef<any>(null);
  const nextStartTimeRef = useRef(0);
  const outputNodeRef = useRef<GainNode | null>(null);

  const toggleLiveSession = async () => {
    if (isLive) {
      sessionRef.current?.close();
      setIsLive(false);
      return;
    }

    setIsConnecting(true);
    // Fix: Ensure fresh GoogleGenAI instance initialization before session start
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    try {
      // Fix: Use standard AudioContext with proper fallback for cross-browser support
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      outputNodeRef.current = audioContextRef.current.createGain();
      outputNodeRef.current.connect(audioContextRef.current.destination);

      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-12-2025',
        callbacks: {
          onopen: () => {
            setIsLive(true);
            setIsConnecting(false);
            startMicStream(sessionPromise);
          },
          onmessage: async (message: LiveServerMessage) => {
            const parts = message.serverContent?.modelTurn?.parts;
            const audioData = parts?.[0]?.inlineData?.data;
            
            if (audioData && audioContextRef.current) {
              // Fix: Implement gapless audio playback by tracking nextStartTime
              const buffer = await decodeAudioData(decode(audioData), audioContextRef.current, 24000, 1);
              const source = audioContextRef.current.createBufferSource();
              source.buffer = buffer;
              source.connect(outputNodeRef.current!);
              nextStartTimeRef.current = Math.max(nextStartTimeRef.current, audioContextRef.current.currentTime);
              source.start(nextStartTimeRef.current);
              nextStartTimeRef.current += buffer.duration;
            }

            // Fix: Capture and display transcription text in UI message list
            if (message.serverContent?.outputTranscription?.text) {
               const transcription = message.serverContent.outputTranscription.text;
               setMessages(prev => [...prev, { role: 'model', text: transcription }]);
            }
          },
          onclose: () => setIsLive(false),
          onerror: (e) => console.error("Live Error:", e)
        },
        config: {
          responseModalities: [Modality.AUDIO],
          // Fix: Enable both input and output audio transcription in session config
          outputAudioTranscription: {},
          inputAudioTranscription: {},
          systemInstruction: "You are EcoFreight AI, an expert logistics coordinator. You support multiple languages including English, Turkish, and Greek. If the user speaks or writes in Turkish, respond in Turkish professionally. You have access to real-time shipment data and carbon metrics. Help the user optimize their supply chain and reduce emissions. Be professional, concise, and proactive."
        }
      });
      sessionRef.current = await sessionPromise;
    } catch (err) {
      console.error(err);
      setIsConnecting(false);
    }
  };

  const startMicStream = async (sessionPromise: Promise<any>) => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    // Fix: Correct sample rate for input audio context
    const inputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
    const source = inputCtx.createMediaStreamSource(stream);
    const processor = inputCtx.createScriptProcessor(4096, 1, 1);

    processor.onaudioprocess = (e) => {
      const inputData = e.inputBuffer.getChannelData(0);
      const pcm = new Int16Array(inputData.length);
      for (let i = 0; i < inputData.length; i++) pcm[i] = inputData[i] * 32768;
      
      // Fix: Solely rely on sessionPromise resolution to send data
      sessionPromise.then(session => {
        session.sendRealtimeInput({
          media: { data: encode(new Uint8Array(pcm.buffer)), mimeType: 'audio/pcm;rate=16000' }
        });
      });
    };

    source.connect(processor);
    processor.connect(inputCtx.destination);
  };

  // Fix: Manual base64 decode implementation following guidelines
  const decode = (base64: string) => {
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
  };

  // Fix: Manual base64 encode implementation following guidelines
  const encode = (bytes: Uint8Array) => {
    let binary = '';
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  };
  
  // Fix: Manual raw PCM audio decoding logic for Gemini Live API
  const decodeAudioData = async (data: Uint8Array, ctx: AudioContext, sampleRate: number, channels: number) => {
    const dataInt16 = new Int16Array(data.buffer);
    const frameCount = dataInt16.length / channels;
    const buffer = ctx.createBuffer(channels, frameCount, sampleRate);
    for (let c = 0; c < channels; c++) {
      const channelData = buffer.getChannelData(c);
      for (let i = 0; i < frameCount; i++) {
        channelData[i] = dataInt16[i * channels + c] / 32768.0;
      }
    }
    return buffer;
  };

  return (
    <div className="h-full flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">AI Command Center</h1>
          <p className="text-slate-500 font-medium">Real-time Multimodal Logistics Intelligence</p>
        </div>
        <div className="flex items-center gap-2 bg-emerald-50 text-emerald-700 px-4 py-2 rounded-2xl border border-emerald-100 shadow-sm">
          <ShieldCheck size={16} />
          <span className="text-[10px] font-black uppercase tracking-widest">Quantum Encrypted Session</span>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-8 min-h-0">
        <div className="lg:col-span-2 flex flex-col bg-white rounded-[3rem] border border-slate-200 shadow-xl shadow-slate-200/50 overflow-hidden">
          <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500 ${isLive ? 'bg-emerald-500 shadow-lg shadow-emerald-500/40 text-white animate-pulse' : 'bg-slate-200 text-slate-500'}`}>
                <Sparkles size={24} />
              </div>
              <div>
                <h3 className="font-bold text-slate-800">Gemini Live Co-Pilot</h3>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  {isLive ? 'Active Audio Link' : 'Standby Mode'}
                </p>
              </div>
            </div>
            <button 
              onClick={toggleLiveSession}
              disabled={isConnecting}
              className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-bold text-sm transition-all active:scale-95 ${isLive ? 'bg-red-50 text-red-600 hover:bg-red-100' : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-lg shadow-emerald-600/20'}`}
            >
              {isConnecting ? <Loader2 className="animate-spin" size={20} /> : (isLive ? <><MicOff size={20} /> End Session</> : <><Mic size={20} /> Start Voice Ops</>)}
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-8 space-y-6 custom-scrollbar">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-40">
                <MessageSquare size={48} className="text-slate-300" />
                <p className="text-sm font-medium text-slate-500 max-w-xs">Ask anything about your shipments, emissions, or route optimizations.</p>
              </div>
            ) : (
              messages.map((m, i) => (
                <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] p-5 rounded-[2rem] text-sm font-medium leading-relaxed ${m.role === 'user' ? 'bg-emerald-600 text-white rounded-tr-none' : 'bg-slate-100 text-slate-700 rounded-tl-none'}`}>
                    {m.text}
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="p-6 bg-slate-50 border-t border-slate-100">
             <div className="flex items-center gap-4 bg-white p-2 rounded-[2rem] border border-slate-200 shadow-sm focus-within:ring-2 ring-emerald-500/20 transition-all">
                <input 
                  type="text" 
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Type a command..." 
                  className="flex-1 bg-transparent px-6 py-2 outline-none text-sm font-medium" 
                />
                <button className="bg-slate-900 text-white p-3 rounded-full hover:bg-black transition-colors">
                  <Send size={18} />
                </button>
             </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-slate-900 rounded-[3rem] p-8 text-white shadow-2xl relative overflow-hidden">
             <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full -mr-16 -mt-16 blur-2xl"></div>
             <h3 className="text-emerald-400 text-[10px] font-black uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
               <Terminal size={14} /> Quick Actions
             </h3>
             <div className="space-y-3">
               <QuickActionButton label="Check Suez Delays" />
               <QuickActionButton label="Emission Summary" />
               <QuickActionButton label="Fleet Optimization" />
             </div>
          </div>

          <div className="bg-white rounded-[3rem] p-8 border border-slate-200 shadow-sm">
             <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl"><Volume2 size={20} /></div>
                <h4 className="font-extrabold text-slate-800 text-xs uppercase tracking-wider">Audio Telemetry</h4>
             </div>
             <div className="space-y-4">
                <div className="flex justify-between items-center text-xs font-bold text-slate-500">
                  <span>Input Gain</span>
                  <div className="h-1.5 w-32 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 w-2/3"></div>
                  </div>
                </div>
                <div className="flex justify-between items-center text-xs font-bold text-slate-500">
                  <span>Latency</span>
                  <span className="text-emerald-600">120ms</span>
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const QuickActionButton = ({ label }: { label: string }) => (
  <button className="w-full text-left p-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all text-sm font-bold flex justify-between items-center group">
    {label}
    <div className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
      <Send size={12} />
    </div>
  </button>
);

export default AIAssistant;
