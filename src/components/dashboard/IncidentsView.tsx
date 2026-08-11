import React from 'react';
import type { Incident } from '../../types/dashboard';
import { AlertTriangle, Clock, ShieldAlert, CheckCircle2 } from 'lucide-react';

interface IncidentsViewProps {
  incidents: Incident[];
  onResolveIncident?: (id: string) => void;
}

export const IncidentsView: React.FC<IncidentsViewProps> = ({ incidents, onResolveIncident }) => {
  return (
    <div className="glass-panel rounded-2xl border border-slate-800 p-6 shadow-xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-rose-400" />
            <h2 className="text-lg font-extrabold text-white tracking-tight">Active Delivery Incidents</h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Real-time traffic delays, customer access issues, and route bottlenecks
          </p>
        </div>
        <span className="px-3 py-1 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20 text-xs font-bold">
          {incidents.filter(i => !i.resolved).length} Unresolved Alerts
        </span>
      </div>

      <div className="space-y-4">
        {incidents.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-sm">
            <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
            No active incidents. All deliveries running smoothly!
          </div>
        ) : (
          incidents.map((incident) => (
            <div
              key={incident.id}
              className={`p-5 rounded-xl border transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                incident.resolved 
                  ? 'bg-slate-950/40 border-slate-800/60 opacity-60' 
                  : 'bg-rose-500/5 border-rose-500/20 hover:border-rose-500/30'
              }`}
            >
              <div className="space-y-1.5 flex-1">
                <div className="flex items-center gap-3">
                  <span className="font-mono font-bold text-cyan-400 text-sm">{incident.trackingCode}</span>
                  <span className={`px-2 py-0.5 text-[11px] font-extrabold uppercase tracking-wider rounded ${
                    incident.severity === 'high' ? 'bg-rose-500/20 text-rose-300' : 'bg-amber-500/20 text-amber-300'
                  }`}>
                    {incident.severity} Severity
                  </span>
                  <span className="text-xs text-slate-500 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {incident.timestamp}
                  </span>
                </div>
                <h4 className="font-bold text-slate-200 text-sm">{incident.type}</h4>
                <p className="text-xs text-slate-400">{incident.description}</p>
              </div>

              {!incident.resolved && onResolveIncident && (
                <button
                  onClick={() => onResolveIncident(incident.id)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-emerald-500 text-slate-200 hover:text-slate-950 font-bold text-xs transition-colors shrink-0 flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Mark Resolved
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
