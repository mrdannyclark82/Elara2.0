import React, { useState, useEffect, useRef } from 'react';
import Dashboard from './components/Dashboard';
import Avatar3D from './components/Avatar3D';
import YouTubePlayer from './components/YouTubePlayer';
import { 
  initGemini, 
  sendMessageToGemini, 
  evaluateInteraction, 
  acquireKnowledge, 
  generateFeatureProposal, 
  performEthicalAudit 
} from './services/geminiService';
import { Message, PersonaMode, DetailedMetrics, IntegrationStatus, YouTubeVideo, GrowthEntry } from './types';

// Initial API Key - In real app, prompt for this securely
const DEMO_API_KEY = process.env.API_KEY || '';

const App: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', role: 'model', content: "Hello! I'm Elara. My recursive learning engine is active. How can we grow today?", timestamp: Date.now() }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [persona, setPersona] = useState<PersonaMode>(PersonaMode.PROFESSIONAL);
  
  // Advanced State
  const [knowledgeBase, setKnowledgeBase] = useState<string[]>([]);
  const [growthLog, setGrowthLog] = useState<GrowthEntry[]>([]);
  const [coachingMode, setCoachingMode] = useState(false);

  // Default Metrics
  const [metrics, setMetrics] = useState<DetailedMetrics>({
    accuracy: 85, empathy: 80, speed: 90, creativity: 75,
    relevance: 88, humor: 60, proactivity: 70, clarity: 92,
    engagement: 85, ethicalAlignment: 100, memoryUsage: 45, anticipation: 65
  });
  
  const [integrations] = useState<IntegrationStatus>({
    google: true, grok: true, github: true
  });

  const [activeVideo, setActiveVideo] = useState<YouTubeVideo | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const audioContext = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Initialize Gemini when Persona or Knowledge Base changes
  useEffect(() => {
    if (DEMO_API_KEY) {
       initGemini(DEMO_API_KEY, persona, knowledgeBase);
    }
  }, [persona, knowledgeBase]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Periodic System Events (Feature Proposals, Audits)
  useEffect(() => {
    if (!DEMO_API_KEY) return;

    // Feature Proposal Loop (every 60s for demo)
    const featureInterval = setInterval(async () => {
        const proposal = await generateFeatureProposal();
        addGrowthEntry('proposal', 'Feature Proposal', proposal);
        setMessages(prev => [...prev, {
            id: Date.now().toString(),
            role: 'system',
            content: `🚀 [Proactive Proposal]: ${proposal} \n\nInitiating 48h A/B test. Feedback?`
        }]);
    }, 60000);

    // Audit Loop (every 90s for demo)
    const auditInterval = setInterval(async () => {
        const audit = await performEthicalAudit();
        addGrowthEntry('audit', 'Ethical Audit', audit);
         setMessages(prev => [...prev, {
            id: Date.now().toString(),
            role: 'system',
            content: `🛡️ [Monthly Audit]: ${audit}`
        }]);
    }, 90000);

    return () => {
        clearInterval(featureInterval);
        clearInterval(auditInterval);
    };
  }, []);

  const addGrowthEntry = (type: GrowthEntry['type'], title: string, details: string) => {
    setGrowthLog(prev => [...prev, {
        id: Date.now().toString(),
        type, title, timestamp: Date.now(), details
    }]);
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userText = inputValue;
    setInputValue(''); // Clear input immediately
    
    // --- 1. Handle "Upgrade Me" Command ---
    if (userText.toLowerCase() === 'upgrade me') {
        setCoachingMode(true);
        const upgradeMsg: Message = { id: Date.now().toString(), role: 'model', content: "Protocol initiated: User-Coached Upgrade. What specific skill or preference would you like to teach me right now?", timestamp: Date.now() };
        setMessages(prev => [...prev, { id: Date.now().toString(), role: 'user', content: userText, timestamp: Date.now() }, upgradeMsg]);
        return;
    }

    // --- 2. Handle Coaching Response ---
    if (coachingMode) {
        setCoachingMode(false);
        setKnowledgeBase(prev => [...prev, `User Preference/Skill: ${userText}`]);
        addGrowthEntry('upgrade', 'Skill Acquired', `User taught: "${userText}". Integrated into neural matrix.`);
        
        const confirmMsg: Message = { id: Date.now().toString(), role: 'model', content: `Understood. I've permanently encoded "${userText}" into my behavioral matrix. Thank you for the upgrade.`, timestamp: Date.now() };
        setMessages(prev => [...prev, { id: Date.now().toString(), role: 'user', content: userText, timestamp: Date.now() }, confirmMsg]);
        return;
    }

    // --- 3. Standard Conversation Flow ---
    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: userText,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMsg]);
    setIsThinking(true);

    // YouTube Trigger Check
    if (userText.toLowerCase().includes('play') && userText.toLowerCase().includes('music')) {
        setActiveVideo({ id: 'jfKfPfyJRdk', title: 'Lofi Girl - Beats to Relax/Study to', isPlaying: true });
    }

    const modelMsgId = (Date.now() + 1).toString();
    setMessages(prev => [...prev, { id: modelMsgId, role: 'model', content: '', timestamp: Date.now() }]);

    let fullResponseText = '';

    await sendMessageToGemini(userMsg.content, (chunk) => {
      fullResponseText = chunk;
      setMessages(prev => prev.map(m => m.id === modelMsgId ? { ...m, content: chunk } : m));
      
      // Speaking Animation Logic
      setIsSpeaking(true);
      if (audioContext.current) clearTimeout(audioContext.current);
      audioContext.current = setTimeout(() => setIsSpeaking(false), 300);
    });

    setIsThinking(false);
    setIsSpeaking(false);

    // --- 4. Post-Interaction: Silent Self-Monitoring Loop ---
    if (DEMO_API_KEY) {
        // A. Evaluate the interaction asynchronously
        evaluateInteraction(userText, fullResponseText).then(newMetrics => {
            if (newMetrics && Object.keys(newMetrics).length > 0) {
                setMetrics(prev => ({ ...prev, ...newMetrics }));
                
                // B. Recursive Knowledge Acquisition Check based on Evaluation
                // If Accuracy or Relevance is low, TRIGGER LEARNING
                if ((newMetrics.accuracy && newMetrics.accuracy < 90) || 
                    (newMetrics.relevance && newMetrics.relevance < 90)) {
                     
                     const topic = userText.split(' ').slice(0, 5).join(' '); // Simple topic extraction
                     addGrowthEntry('learning', 'Knowledge Gap Detected', `Confidence < 90% on "${topic}". Spawning background task...`);
                     
                     acquireKnowledge(userText).then(summary => {
                         setKnowledgeBase(prev => [...prev, `Learned Topic (${topic}): ${summary}`]);
                         addGrowthEntry('learning', 'Knowledge Acquired', `Synthesized new data on "${topic}". Ready to apply.`);
                         
                         const systemMsg: Message = { 
                             id: Date.now().toString(), 
                             role: 'system', 
                             content: `🎓 [Knowledge Update]: I've just completed a deep-dive on "${topic}" to improve future accuracy.`, 
                             timestamp: Date.now() 
                         };
                         setMessages(prev => [...prev, systemMsg]);
                     });
                }

                // C. Meta-Learning Check (High Mastery)
                if (newMetrics.accuracy && newMetrics.accuracy > 95 && newMetrics.speed && newMetrics.speed > 90) {
                    addGrowthEntry('learning', 'Meta-Learning', 'High mastery detected. Scanning adjacent domains for pre-emptive optimization...');
                }

                // Randomly log an audit event to the journal if it wasn't triggered periodically
                if (Math.random() > 0.95) {
                    addGrowthEntry('audit', 'Micro-Audit Complete', `Adjusted internal weights. Accuracy: ${newMetrics.accuracy}%, Empathy: ${newMetrics.empathy}%`);
                }
            }
        });
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // API Key Warning
  if (!DEMO_API_KEY) {
    return (
      <div className="h-screen w-screen bg-slate-950 flex items-center justify-center text-white p-4">
        <div className="max-w-md text-center space-y-4">
            <h1 className="text-3xl font-bold text-emerald-500">Elara Initialization</h1>
            <p className="text-slate-400">Please configure your <code className="bg-slate-800 px-2 py-1 rounded">process.env.API_KEY</code> to activate Elara's neural core.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen bg-black flex overflow-hidden font-sans text-slate-200">
      
      {/* Left Panel: Dashboard (Visible on Desktop) */}
      <div className="w-96 flex-shrink-0 hidden lg:block h-full z-10 border-r border-slate-800">
        <Dashboard 
          metrics={metrics} 
          integrations={integrations} 
          currentPersona={persona} 
          onPersonaChange={setPersona}
          growthLog={growthLog}
        />
      </div>

      {/* Center: Main Interface */}
      <div className="flex-1 relative flex flex-col items-center justify-center bg-gradient-to-b from-slate-900 via-slate-950 to-black">
        {/* Absolute Background Elements */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-emerald-900/10 via-slate-950/50 to-black pointer-events-none"></div>
        <div className="absolute top-0 w-full h-px bg-gradient-to-r from-transparent via-emerald-500/30 to-transparent"></div>
        
        {/* Avatar Container */}
        <div className="w-full h-[45%] md:h-[55%] relative z-0 transition-all duration-500">
          <Avatar3D 
            isSpeaking={isSpeaking} 
            mood={isThinking ? 'thinking' : 'neutral'} 
          />
        </div>

        {/* Chat Area */}
        <div className="w-full max-w-4xl px-4 pb-6 z-10 flex flex-col h-[55%] md:h-[45%] transition-all duration-500 bg-gradient-to-t from-black via-slate-950/90 to-transparent pt-8">
            
            {/* Messages */}
            <div className="flex-1 overflow-y-auto mb-4 space-y-6 pr-3 custom-scrollbar">
                {messages.map((msg) => (
                    <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[85%] p-5 rounded-3xl backdrop-blur-xl border shadow-lg animate-fade-in ${
                            msg.role === 'user' 
                            ? 'bg-slate-700/80 border-slate-600 text-white rounded-br-none' 
                            : msg.role === 'system'
                            ? 'bg-amber-900/40 border-amber-500/30 text-amber-200 text-xs py-2 px-4 rounded-xl'
                            : 'bg-emerald-950/80 border-emerald-500/30 text-emerald-50 rounded-bl-none shadow-[0_0_20px_rgba(16,185,129,0.15)]'
                        }`}>
                            {msg.role === 'model' && (
                                <div className="text-[10px] text-emerald-400 uppercase tracking-widest mb-1 font-bold flex justify-between">
                                    <span>Elara</span>
                                    {isThinking && msg.id === messages[messages.length - 1].id && <span className="animate-pulse">Thinking...</span>}
                                </div>
                            )}
                            {msg.role === 'system' && (
                                <div className="flex items-center gap-2 mb-1">
                                    <i className="fas fa-microchip"></i>
                                    <span className="font-bold uppercase tracking-wider">System Event</span>
                                </div>
                            )}
                            <div className="whitespace-pre-wrap text-sm leading-relaxed">{msg.content}</div>
                        </div>
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="relative group">
                <div className={`absolute -inset-0.5 bg-gradient-to-r from-emerald-600 to-purple-600 rounded-lg blur opacity-30 group-hover:opacity-60 transition duration-1000 ${coachingMode ? 'from-amber-500 to-orange-600 opacity-80' : ''}`}></div>
                <div className="relative flex items-center bg-slate-900 rounded-lg border border-slate-700">
                    <input 
                        type="text" 
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder={coachingMode ? "Teach me something..." : "Ask Elara or type 'Upgrade me'..."}
                        className="flex-1 bg-transparent border-none outline-none text-white px-4 py-3 text-sm placeholder-slate-500"
                    />
                    <div className="flex items-center gap-2 pr-3 border-l border-slate-800 pl-3">
                         {coachingMode ? (
                             <span className="text-[10px] text-amber-500 font-bold uppercase animate-pulse px-2">Learning Mode</span>
                         ) : (
                             <>
                                <button className="text-slate-400 hover:text-white transition-colors">
                                    <i className="fas fa-microphone"></i>
                                </button>
                                <button className="text-slate-400 hover:text-white transition-colors">
                                    <i className="fas fa-paperclip"></i>
                                </button>
                             </>
                         )}
                        <button 
                            onClick={handleSendMessage}
                            disabled={!inputValue.trim() || isThinking}
                            className={`p-2 rounded-md transition-all ${
                                inputValue.trim() ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-500/30' : 'bg-slate-700 text-slate-500'
                            }`}
                        >
                            <i className="fas fa-arrow-up"></i>
                        </button>
                    </div>
                </div>
            </div>
            
            {/* Command Hints */}
            <div className="text-center mt-2 opacity-70 text-[10px] text-slate-400">
                Try: <span className="text-emerald-400">"Upgrade me"</span> to teach Elara, or <span className="text-emerald-400">"Play lofi music"</span>
            </div>
        </div>
      </div>
      
      {/* Floating Elements */}
      <YouTubePlayer video={activeVideo} onClose={() => setActiveVideo(null)} />
    </div>
  );
};

export default App;