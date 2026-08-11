import React from 'react';
import type { Route } from '../../types/dashboard';
import { MapPin, Navigation, CheckCircle2, Clock } from 'lucide-react';

interface RoutesViewProps {
  routes: Route[];
}

export const RoutesView: React.FC<RoutesViewProps> = ({ routes }) => {
  return (
    <div className="glass-panel rounded-2xl border border-slate-800 p-6 shadow-xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-indigo-400" />
            <h2 className="text-lg font-extrabold text-white tracking-tight">Active Delivery Routes</h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Dynamic last-mile stop progression and route efficiency metrics
          </p>
        </div>
        <span className="px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-xs font-bold">
          {routes.length} Active Routes
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {routes.map((r) => {
          const progressPercent = Math.round((r.completedStops / r.totalStops) * 100);
          return (
            <div key={r.id} className="p-5 rounded-xl bg-slate-950/60 border border-slate-800 hover:border-slate-700 transition-all">
              <div className="flex items-center justify-between mb-3">
                <span className="font-mono font-extrabold text-cyan-400 text-base">{r.routeCode}</span>
                <span className="px-2.5 py-1 rounded-full bg-cyan-500/10 text-cyan-400 text-xs font-bold border border-cyan-500/20">
                  In Progress
                </span>
              </div>

              <div className="space-y-2 py-3 border-y border-slate-800/80 text-xs">
                <div className="flex justify-between text-slate-400">
                  <span>Driver & Vehicle:</span>
                  <span className="font-semibold text-slate-200">{r.driverName} ({r.vehiclePlate})</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Est. Distance:</span>
                  <span className="font-mono font-semibold text-slate-200">{r.estimatedDistanceKm} km</span>
                </div>
              </div>

              {/* Progress bar */}
              <div className="mt-4">
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="text-slate-400 font-medium">Progress ({r.completedStops} / {r.totalStops} stops)</span>
                  <span className="font-mono font-bold text-cyan-400">{progressPercent}%</span>
                </div>
                <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
                  <div 
                    className="bg-gradient-to-r from-cyan-500 to-blue-500 h-full rounded-full transition-all duration-500" 
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
