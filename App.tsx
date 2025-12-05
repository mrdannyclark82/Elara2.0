import React, { useState, useEffect, useRef } from 'react';
import Dashboard from './components/Dashboard';
import Avatar3D from './components/Avatar3D';
import YouTubePlayer from './components/YouTubePlayer';
import LiveSession from './components/LiveSession';
import { 
  initGemini, 
  processUserRequest,
  evaluateInteraction, 
  acquireKnowledge, 
  generateFeatureProposal, 
  performEthicalAudit 
} from './services/geminiService';
import { Message, PersonaMode, DetailedMetrics, IntegrationStatus, YouTubeVideo, GrowthEntry, ToolMode, Attachment } from './types';

const DEMO_API_KEY = process.env.API_KEY || '';

// Hook for Persistent State
function usePersistentState<T>(key: string, initialValue: T): [T, React.Dispatch<React.SetStateAction<T>>] {
  const [state, setState] = useState<T>(() => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(state));
    } catch (error) {
      console.warn(`Error saving localStorage key "${key}":`, error);
    }
  }, [key, state]);

  return [state, setState];
}

const App: React.FC = () => {
  // Persistent Chat State
  const [messages, setMessages] = usePersistentState<Message[]>('elara_messages', [
    { id: '1', role: 'model', content: "Systems Online. Neural Toolkit Active. I can search, generate images, create videos, and analyze your files. How can I help?", timestamp: Date.now() }
  ]);
  
  // Persistent Advanced State
  const [knowledgeBase, setKnowledgeBase] = usePersistentState<string[]>('elara_kb', []);
  const [growthLog, setGrowthLog] = usePersistentState<GrowthEntry[]>('elara_growth', []);
  const [metrics, setMetrics] = usePersistentState<DetailedMetrics>('elara_metrics', {
    accuracy: 85, empathy: 80, speed: 90, creativity: 75,
    relevance: 88, humor: 60, proactivity: 70, clarity: 92,
    engagement: 85, ethicalAlignment: 100, memoryUsage: 45, anticipation: 65
  });
  const [persona, setPersona] = usePersistentState<PersonaMode>('elara_persona', PersonaMode.PROFESSIONAL);

  // Transient State
  const [inputValue, setInputValue] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [selectedTool, setSelectedTool] = useState<ToolMode>(ToolMode.CHAT);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [liveSessionActive, setLiveSessionActive] = useState(false);
  const [coachingMode, setCoachingMode] = useState(false);
  const [integrations] = useState<IntegrationStatus>({ google: true, grok: true, github: true });
  const [activeVideo, setActiveVideo] = useState<YouTubeVideo | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (DEMO_API_KEY) {
       initGemini(DEMO_API_KEY);
    }
  }, [persona, knowledgeBase]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Periodic Events
  /*useEffect(() => {
    if (!DEMO_API_KEY) return;
    const featureInterval = setInterval(async () => {
        const proposal = await generateFeatureProposal();
        addGrowthEntry('proposal', 'Feature Proposal', proposal);
    }, 60000);
    const auditInterval = setInterval(async () => {
        const audit = await performEthicalAudit();
        addGrowthEntry('audit', 'Ethical Audit', audit);
    }, 90000);
    return () => { clearInterval(featureInterval); clearInterval(auditInterval); };
  }, []);*/

  const addGrowthEntry = (type: GrowthEntry['type'], title: string, details: string) => {
    setGrowthLog(prev => [...prev, { id: Date.now().toString(), type, title, timestamp: Date.now(), details }]);
  };

  const handleClearMemory = () => {
    if (window.confirm("Are you sure you want to purge all memory? This cannot be undone.")) {
      localStorage.clear();
      window.location.reload();
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onloadend = () => {
          const base64String = (reader.result as string).split(',')[1];
          const preview = reader.result as string;
          setAttachments(prev => [...prev, { 
              mimeType: file.type, 
              data: base64String,
              previewUri: file.type.startsWith('image/') ? preview : undefined 
          }]);
      };
      reader.readAsDataURL(file);
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() && attachments.length === 0) return;

    const userText = inputValue;
    const currentTool = selectedTool;
    const currentAttachments = [...attachments];
    
    setInputValue('');
    setAttachments([]); // Clear attachments after sending
    
    // Coaching Mode Trap
    if (userText.toLowerCase() === 'upgrade me') {
        setCoachingMode(true);
        setMessages(prev => [...prev, { id: Date.now().toString(), role: 'user', content: userText, timestamp: Date.now() }, { id: (Date.now()+1).toString(), role: 'model', content: "Protocol initiated. Teach me something.", timestamp: Date.now() }]);
        return;
    }
    if (coachingMode) {
        setCoachingMode(false);
        setKnowledgeBase(prev => [...prev, userText]);
        setMessages(prev => [...prev, { id: Date.now().toString(), role: 'user', content: userText, timestamp: Date.now() }, { id: (Date.now()+1).toString(), role: 'model', content: "Learned.", timestamp: Date.now() }]);
        return;
    }

    // Add User Message
    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: userText, timestamp: Date.now() };
    if (currentAttachments.length > 0) {
        // Just show the first attachment preview in chat for now
        userMsg.imageUri = currentAttachments[0].previewUri; 
        userMsg.content += ` [Attached ${currentAttachments.length} file(s)]`;
    }
    setMessages(prev => [...prev, userMsg]);
    setIsThinking(true);

    // Process Request
    try {
        const result = await processUserRequest(userText, currentTool, currentAttachments, persona, knowledgeBase);
        setMessages(prev => [...prev, { ...result, id: Date.now().toString() } as Message]);

        // Self Monitoring & Learning
        if (DEMO_API_KEY && result.content) {
            evaluateInteraction(userText, result.content).then(newMetrics => {
                if (newMetrics.accuracy && newMetrics.accuracy < 90) {
                     acquireKnowledge(userText).then(summary => {
                         setKnowledgeBase(prev => [...prev, summary]);
                         addGrowthEntry('learning', 'Gap Detected', `Learned: ${summary}`);
                     });
                }
                setMetrics(prev => ({ ...prev, ...newMetrics }));
            });
        }
    } catch (error) {
        setMessages(prev => [...prev, { id: Date.now().toString(), role: 'model', content: "System Error.", timestamp: Date.now() }]);
    } finally {
        setIsThinking(false);
    }
  };

  if (!DEMO_API_KEY) {
    return <div className="h-screen w-screen bg-slate-950 flex items-center justify-center text-emerald-500">API_KEY Required</div>;
  }

  return (
    <div className="h-screen w-screen bg-black flex overflow-hidden font-sans text-slate-200">
      {/* Live Session Overlay */}
      {liveSessionActive && (
          <LiveSession 
             apiKey={DEMO_API_KEY} 
             onClose={() => setLiveSessionActive(false)} 
             systemInstruction={`You are Elara. ${persona} mode.`}
          />
      )}

      {/* Left Panel */}
      <div className="w-96 flex-shrink-0 hidden lg:block h-full z-10 border-r border-slate-800">
        <Dashboard 
          metrics={metrics} 
          integrations={integrations} 
          currentPersona={persona} 
          onPersonaChange={setPersona} 
          growthLog={growthLog}
          onClearMemory={handleClearMemory}
        />
      </div>

      {/* Main Interface */}
      <div className="flex-1 relative flex flex-col items-center justify-center bg-gradient-to-b from-slate-900 via-slate-950 to-black">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-emerald-900/10 via-slate-950/50 to-black pointer-events-none"></div>
        
        {/* Avatar */}
        <div className="w-full h-[40%] md:h-[50%] relative z-0">
          <Avatar3D isSpeaking={isThinking} mood={isThinking ? 'thinking' : 'neutral'} />
        </div>

        {/* Chat Area */}
        <div className="w-full max-w-4xl px-4 pb-6 z-10 flex flex-col h-[60%] md:h-[50%] transition-all duration-500 bg-gradient-to-t from-black via-slate-950/90 to-transparent pt-8">
            
            {/* Messages */}
            <div className="flex-1 overflow-y-auto mb-4 space-y-6 pr-3 custom-scrollbar">
                {messages.map((msg) => (
                    <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[85%] p-5 rounded-3xl backdrop-blur-xl border shadow-lg ${
                            msg.role === 'user' ? 'bg-slate-700/80 border-slate-600 text-white rounded-br-none' : 
                            'bg-emerald-950/80 border-emerald-500/30 text-emerald-50 rounded-bl-none'
                        }`}>
                            <div className="whitespace-pre-wrap text-sm leading-relaxed">{msg.content}</div>
                            
                            {/* Rich Content Rendering */}
                            {msg.imageUri && (
                                <div className="mt-3 rounded-xl overflow-hidden border border-slate-700">
                                    <img src={msg.imageUri} alt="Generated" className="w-full h-auto" />
                                </div>
                            )}
                            {msg.videoUri && (
                                <div className="mt-3 rounded-xl overflow-hidden border border-slate-700">
                                    <video controls src={msg.videoUri} className="w-full h-auto" />
                                </div>
                            )}
                            {msg.groundingSources && (
                                <div className="mt-3 flex flex-wrap gap-2">
                                    {msg.groundingSources.map((src, i) => (
                                        <a key={i} href={src.uri} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-[10px] bg-slate-900 px-2 py-1 rounded border border-slate-700 hover:border-emerald-500 transition-colors">
                                            <i className="fas fa-external-link-alt text-emerald-500"></i>
                                            {src.title}
                                        </a>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>

            {/* Attachments Preview */}
            {attachments.length > 0 && (
                <div className="flex gap-2 mb-2 px-2 overflow-x-auto">
                    {attachments.map((att, i) => (
                        <div key={i} className="relative w-16 h-16 bg-slate-800 rounded border border-slate-600 flex items-center justify-center overflow-hidden">
                             {att.previewUri ? <img src={att.previewUri} className="w-full h-full object-cover" /> : <i className="fas fa-file text-slate-400"></i>}
                             <button onClick={() => setAttachments(prev => prev.filter((_, idx) => idx !== i))} className="absolute top-0 right-0 bg-red-500 text-white w-4 h-4 flex items-center justify-center text-[10px]">×</button>
                        </div>
                    ))}
                </div>
            )}

            {/* Input & Toolkit */}
            <div className="flex flex-col gap-2">
                {/* Tool Selector */}
                <div className="flex gap-2 px-1">
                    {[
                        { id: ToolMode.CHAT, icon: 'fa-brain', label: 'Chat' },
                        { id: ToolMode.SEARCH, icon: 'fa-search', label: 'Google Search' },
                        { id: ToolMode.MAPS, icon: 'fa-map-marker-alt', label: 'Maps' },
                        { id: ToolMode.IMAGE_GEN, icon: 'fa-image', label: 'Imagine' },
                        { id: ToolMode.VIDEO_GEN, icon: 'fa-video', label: 'Veo Video' },
                    ].map(tool => (
                        <button
                            key={tool.id}
                            onClick={() => setSelectedTool(tool.id)}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs transition-all border ${
                                selectedTool === tool.id 
                                ? 'bg-emerald-500 text-black border-emerald-400 font-bold shadow-[0_0_10px_rgba(16,185,129,0.4)]' 
                                : 'bg-slate-900 text-slate-400 border-slate-700 hover:border-slate-500'
                            }`}
                        >
                            <i className={`fas ${tool.icon}`}></i> {tool.label}
                        </button>
                    ))}
                </div>

                <div className="relative group">
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-600 to-purple-600 rounded-lg blur opacity-30 group-hover:opacity-60 transition duration-1000"></div>
                    <div className="relative flex items-center bg-slate-900 rounded-lg border border-slate-700">
                         {/* File Upload */}
                        <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileUpload} accept="image/*,video/*" />
                        <button onClick={() => fileInputRef.current?.click()} className="pl-3 pr-2 text-slate-400 hover:text-white transition-colors">
                            <i className="fas fa-paperclip"></i>
                        </button>

                        <input 
                            type="text" 
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                            placeholder={
                                selectedTool === ToolMode.IMAGE_GEN ? "Describe the image to generate..." :
                                selectedTool === ToolMode.VIDEO_GEN ? "Describe the video (attach image for reference)..." :
                                "Message Elara..."
                            }
                            className="flex-1 bg-transparent border-none outline-none text-white px-2 py-3 text-sm placeholder-slate-500"
                        />
                        
                        <div className="flex items-center gap-2 pr-3 border-l border-slate-800 pl-3">
                            <button onClick={() => setLiveSessionActive(true)} className="text-red-400 hover:text-red-300 transition-colors animate-pulse" title="Start Live Voice Session">
                                <i className="fas fa-microphone-lines"></i>
                            </button>
                            <button 
                                onClick={handleSendMessage}
                                disabled={!inputValue.trim() && attachments.length === 0 || isThinking}
                                className={`p-2 rounded-md transition-all ${
                                    inputValue.trim() || attachments.length > 0 ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-500/30' : 'bg-slate-700 text-slate-500'
                                }`}
                            >
                                <i className="fas fa-arrow-up"></i>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
      </div>
      <YouTubePlayer video={activeVideo} onClose={() => setActiveVideo(null)} />
    </div>
  );
};

export default App;