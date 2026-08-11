import React from 'react';
import type { Vehicle } from '../../types/dashboard';
import { Truck, Battery, ShieldAlert, CheckCircle2 } from 'lucide-react';

interface VehiclesViewProps {
  vehicles: Vehicle[];
}

export const VehiclesView: React.FC<VehiclesViewProps> = ({ vehicles }) => {
  return (
    <div className="glass-panel rounded-2xl border border-slate-800 p-6 shadow-xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-2">
            <Truck className="w-5 h-5 text-cyan-400" />
            <h2 className="text-lg font-extrabold text-white tracking-tight">Fleet Vehicles</h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            EV fleet telematics, capacity limits, and maintenance monitoring
          </p>
        </div>
        <span className="px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 text-xs font-bold">
          {vehicles.length} Units Online
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {vehicles.map((v) => (
          <div key={v.id} className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 hover:border-slate-700 transition-all">
            <div className="flex items-center justify-between mb-3">
              <div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{v.type}</span>
                <h4 className="text-base font-extrabold font-mono text-cyan-400">{v.plateNumber}</h4>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-bold border border-emerald-500/20 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Active
              </span>
            </div>

            <div className="space-y-2 py-3 border-y border-slate-800/80 text-xs">
              <div className="flex justify-between text-slate-400">
                <span>Payload Capacity:</span>
                <span className="font-semibold text-slate-200">{v.capacityKg} kg max</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Assigned Driver:</span>
                <span className="font-semibold text-slate-200">{v.assignedDriverName || 'Unassigned'}</span>
              </div>
            </div>

            <div className="mt-3 flex items-center justify-between text-xs">
              <span className="text-slate-400">Charge Level:</span>
              <div className="flex items-center gap-2">
                <Battery className="w-4 h-4 text-emerald-400" />
                <span className="font-mono font-bold text-emerald-400">{v.fuelOrBatteryPercent}%</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
