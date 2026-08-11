import React, { useState } from 'react';
import type { Driver, DriverStatusType } from '../../types/dashboard';
import { Badge } from '../common/Badge';
import { Users, Battery, Phone, Star, CheckCircle, Truck } from 'lucide-react';

interface DriverStatusProps {
  drivers: Driver[];
}

export const DriverStatus: React.FC<DriverStatusProps> = ({ drivers }) => {
  const [filter, setFilter] = useState<DriverStatusType | 'all'>('all');

  const filteredDrivers = drivers.filter(
    (d) => filter === 'all' || d.status === filter
  );

  return (
    <div className="glass-panel rounded-2xl border border-slate-800 p-6 shadow-xl">
      {/* Title & Status Filter Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-emerald-400" />
            <h2 className="text-lg font-extrabold text-white tracking-tight">Active Driver Fleet</h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Real-time driver location, vehicle assignments, and battery health
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1 p-1 bg-slate-950/80 rounded-xl border border-slate-800">
          {(['all', 'on_delivery', 'available', 'resting'] as const).map((status) => {
            const isActive = filter === status;
            const labelMap = {
              all: 'All Fleet',
              on_delivery: 'On Delivery',
              available: 'Available',
              resting: 'On Break',
            };
            return (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`
                  px-3 py-1.5 rounded-lg text-xs font-semibold transition-all
                  ${isActive 
                    ? 'bg-emerald-500 text-slate-950 font-bold shadow-md shadow-emerald-500/20' 
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'}
                `}
              >
                {labelMap[status]}
              </button>
            );
          })}
        </div>
      </div>

      {/* Driver Fleet Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredDrivers.map((driver) => (
          <div
            key={driver.id}
            className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 hover:border-slate-700 transition-all flex flex-col justify-between"
          >
            <div>
              {/* Driver Avatar, Name & Status Badge */}
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-3">
                  <img
                    src={driver.avatar}
                    alt={driver.name}
                    className="w-11 h-11 rounded-full object-cover border-2 border-slate-700 shadow-md"
                  />
                  <div>
                    <h4 className="font-bold text-slate-100 text-sm">{driver.name}</h4>
                    <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-0.5">
                      <Truck className="w-3.5 h-3.5 text-slate-500" />
                      <span className="font-mono">{driver.vehiclePlate}</span>
                    </div>
                  </div>
                </div>
                <Badge type="driver" value={driver.status} size="sm" />
              </div>

              {/* Location & Metrics */}
              <div className="space-y-2 py-3 my-2 border-y border-slate-800/60 text-xs">
                <div className="flex justify-between text-slate-400">
                  <span>Current Zone:</span>
                  <span className="font-medium text-slate-200">{driver.currentLocationName}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Completed Today:</span>
                  <span className="font-bold text-emerald-400 flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" />
                    {driver.completedDeliveriesToday} drops
                  </span>
                </div>
              </div>
            </div>

            {/* Bottom Row: Battery level meter & Contact action */}
            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center gap-2 text-xs">
                <Battery className={`w-4 h-4 ${driver.batteryPercent < 30 ? 'text-rose-400' : 'text-emerald-400'}`} />
                <div className="w-16 bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full ${driver.batteryPercent < 30 ? 'bg-rose-500' : 'bg-emerald-400'}`} 
                    style={{ width: `${driver.batteryPercent}%` }}
                  />
                </div>
                <span className="font-mono text-[11px] text-slate-400">{driver.batteryPercent}%</span>
              </div>

              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 text-amber-400 text-xs font-bold">
                  <Star className="w-3.5 h-3.5 fill-amber-400" />
                  <span>{driver.rating}</span>
                </div>
                <a
                  href={`tel:${driver.phone}`}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                  title={`Call ${driver.name}`}
                >
                  <Phone className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
