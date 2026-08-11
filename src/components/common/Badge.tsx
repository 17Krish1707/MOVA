import React from 'react';
import type { DeliveryStatus, PriorityLevel, DriverStatusType } from '../../types/dashboard';

interface BadgeProps {
  type: 'status' | 'priority' | 'driver';
  value: DeliveryStatus | PriorityLevel | DriverStatusType | string;
  size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({ type, value, size = 'md' }) => {
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs font-semibold' : 'px-2.5 py-1 text-xs font-bold';

  if (type === 'status') {
    switch (value as DeliveryStatus) {
      case 'in_transit':
        return (
          <span className={`inline-flex items-center gap-1.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 ${sizeClasses}`}>
            <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-pulse" />
            In Transit
          </span>
        );
      case 'pending':
        return (
          <span className={`inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 ${sizeClasses}`}>
            <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
            Pending Dispatch
          </span>
        );
      case 'delayed':
        return (
          <span className={`inline-flex items-center gap-1.5 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20 ${sizeClasses}`}>
            <span className="h-1.5 w-1.5 rounded-full bg-rose-500 animate-ping" />
            Delayed
          </span>
        );
      case 'delivered':
        return (
          <span className={`inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 ${sizeClasses}`}>
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            Delivered
          </span>
        );
      case 'cancelled':
        return (
          <span className={`inline-flex items-center gap-1.5 rounded-full bg-slate-500/10 text-slate-400 border border-slate-500/20 ${sizeClasses}`}>
            Cancelled
          </span>
        );
      default:
        return <span className={`rounded-full bg-slate-800 text-slate-300 ${sizeClasses}`}>{String(value)}</span>;
    }
  }

  if (type === 'priority') {
    switch (value as PriorityLevel) {
      case 'urgent':
        return (
          <span className={`inline-flex items-center uppercase tracking-wider rounded bg-rose-500/20 text-rose-300 border border-rose-500/30 ${sizeClasses}`}>
            ⚡ Urgent
          </span>
        );
      case 'high':
        return (
          <span className={`inline-flex items-center uppercase tracking-wider rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 ${sizeClasses}`}>
            High
          </span>
        );
      case 'normal':
        return (
          <span className={`inline-flex items-center uppercase tracking-wider rounded bg-slate-800 text-slate-300 border border-slate-700 ${sizeClasses}`}>
            Normal
          </span>
        );
      case 'low':
        return (
          <span className={`inline-flex items-center uppercase tracking-wider rounded bg-slate-900 text-slate-400 border border-slate-800 ${sizeClasses}`}>
            Low
          </span>
        );
    }
  }

  if (type === 'driver') {
    switch (value as DriverStatusType) {
      case 'available':
        return (
          <span className={`inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 ${sizeClasses}`}>
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
            Available
          </span>
        );
      case 'on_delivery':
        return (
          <span className={`inline-flex items-center gap-1.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 ${sizeClasses}`}>
            <span className="h-2 w-2 rounded-full bg-cyan-400 animate-pulse" />
            On Delivery
          </span>
        );
      case 'resting':
        return (
          <span className={`inline-flex items-center gap-1.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 ${sizeClasses}`}>
            <span className="h-2 w-2 rounded-full bg-indigo-400" />
            Break
          </span>
        );
      case 'offline':
        return (
          <span className={`inline-flex items-center gap-1.5 rounded-full bg-slate-700/30 text-slate-400 border border-slate-700/50 ${sizeClasses}`}>
            <span className="h-2 w-2 rounded-full bg-slate-500" />
            Offline
          </span>
        );
    }
  }

  return <span className={`rounded-full bg-slate-800 text-slate-300 ${sizeClasses}`}>{String(value)}</span>;
};
