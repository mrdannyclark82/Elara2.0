import React from 'react';
import { DetailedMetrics, IntegrationStatus, PersonaMode, GrowthEntry } from '../types';
import { ResponsiveContainer, Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Tooltip } from 'recharts';

interface DashboardProps {
  metrics: DetailedMetrics;
  integrations: IntegrationStatus;
  currentPersona: PersonaMode;
  onPersonaChange: (p: PersonaMode) => void;
  growthLog: GrowthEntry[];
}

const Dashboard: React.FC<DashboardProps> = ({ metrics, integrations, currentPersona, onPersonaChange, growthLog }) => {
  
  const metricData = Object.keys(metrics).map(key => ({
    subject: key.charAt(0).toUpperCase() + key.slice(1),
    A: metrics[key as keyof DetailedMetrics],
    fullMark: 100,
  }));

  return (
    <div className="h-full bg-slate-900/90 backdrop-blur-xl border-r border-slate-700 flex flex-col overflow-y-auto custom-scrollbar">
      {/* Header */}
      <div className="p-6 border-b border-slate-700">
        <h2 className="text-2xl font-bold text-white mb-1">Elara <span className="text-xs text-emerald-400 align-top">v2.8</span></h2>
        <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
            <p className="text-slate-400 text-xs">Neural Core: <span className="text-emerald-400">Stable</span></p>
        </div>
      </div>

      {/* 12-Axis Live Metrics */}
      <div className="p-4 border-b border-slate-700">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Real-time Evaluation</h3>
        </div>
        <div className="h-64 w-full -ml-4">
           <ResponsiveContainer width="100%" height="100%">
             <RadarChart cx="50%" cy="50%" outerRadius="70%" data={metricData}>
               <PolarGrid stroke="#334155" />
               <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 10 }} />
               <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
               <Radar
                 name="Elara Performance"
                 dataKey="A"
                 stroke="#10b981"
                 strokeWidth={2}
                 fill="#10b981"
                 fillOpacity={0.3}
               />
               <Tooltip 
                 contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }}
                 itemStyle={{ color: '#e2e8f0' }}
               />
             </RadarChart>
           </ResponsiveContainer>
        </div>
        <div className="text-center text-[10px] text-slate-500 mt-[-10px]">
           Last audit: <span className="text-emerald-500">Just now</span>
        </div>
      </div>

      {/* Adaptive Persona */}
      <div className="p-6 border-b border-slate-700">
        <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">Persona Matrix</h3>
        <div className="flex flex-wrap gap-2">
          {Object.values(PersonaMode).map((mode) => (
            <button
              key={mode}
              onClick={() => onPersonaChange(mode)}
              className={`text-xs px-3 py-2 rounded-full border transition-all duration-300 ${
                currentPersona === mode
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50 shadow-[0_0_10px_rgba(16,185,129,0.2)]'
                  : 'bg-slate-800/50 text-slate-500 border-transparent hover:bg-slate-800 hover:text-slate-300'
              }`}
            >
              {mode}
            </button>
          ))}
        </div>
      </div>

      {/* Growth Journal */}
      <div className="p-6 flex-1">
        <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">Growth Journal</h3>
        <div className="space-y-4">
            {growthLog.length === 0 && <p className="text-xs text-slate-600 italic">No evolution events yet.</p>}
            {growthLog.slice().reverse().map((entry) => (
                <div key={entry.id} className="relative pl-4 border-l border-slate-700">
                    <div className={`absolute -left-[5px] top-1 w-2.5 h-2.5 rounded-full ${
                        entry.type === 'learning' ? 'bg-blue-500' :
                        entry.type === 'upgrade' ? 'bg-purple-500' :
                        entry.type === 'audit' ? 'bg-amber-500' : 'bg-emerald-500'
                    }`}></div>
                    <div className="mb-1">
                        <span className="text-xs font-bold text-white block">{entry.title}</span>
                        <span className="text-[10px] text-slate-500">{new Date(entry.timestamp).toLocaleTimeString()}</span>
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed">{entry.details}</p>
                </div>
            ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
