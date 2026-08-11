import React from 'react';
import type { DashboardStats } from '../../types/dashboard';
import { Truck, Clock, Users, AlertTriangle, TrendingUp, TrendingDown } from 'lucide-react';

interface StatCardsProps {
  stats: DashboardStats;
}

export const StatCards: React.FC<StatCardsProps> = ({ stats }) => {
  const cards = [
    {
      title: 'Active Deliveries',
      value: stats.activeDeliveries,
      trend: stats.activeDeliveriesTrend,
      trendUp: true,
      icon: Truck,
      iconBg: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
      glow: 'shadow-cyan-500/5',
      badge: 'In Progress',
      badgeColor: 'bg-cyan-500/20 text-cyan-300',
    },
    {
      title: 'Orders Awaiting Dispatch',
      value: stats.pendingOrders,
      trend: stats.pendingOrdersTrend,
      trendUp: false,
      icon: Clock,
      iconBg: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
      glow: 'shadow-amber-500/5',
      badge: 'Needs Dispatch',
      badgeColor: 'bg-amber-500/20 text-amber-300',
    },
    {
      title: 'Available Drivers',
      value: `${stats.availableDrivers} / ${stats.totalDrivers}`,
      trend: `${stats.availableDrivers} of ${stats.totalDrivers} drivers available`,
      trendUp: true,
      icon: Users,
      iconBg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
      glow: 'shadow-emerald-500/5',
      badge: 'On Standby',
      badgeColor: 'bg-emerald-500/20 text-emerald-300',
    },
    {
      title: 'Delayed Deliveries',
      value: stats.delayedDeliveries,
      trend: stats.delayedDeliveriesTrend,
      trendUp: false,
      icon: AlertTriangle,
      iconBg: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
      glow: 'shadow-rose-500/5',
      badge: 'Needs Attention',
      badgeColor: 'bg-rose-500/20 text-rose-300',
    },
    {
      title: 'Total Drivers',
      value: stats.totalDrivers,
      trend: 'Entire registered fleet',
      trendUp: true,
      icon: Users,
      iconBg: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
      glow: 'shadow-blue-500/5',
      badge: 'Total Fleet',
      badgeColor: 'bg-blue-500/20 text-blue-300',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-8">
      {cards.map((card, index) => {
        const Icon = card.icon;
        return (
          <div
            key={index}
            className={`
              glass-panel glass-panel-hover p-5 rounded-2xl border border-slate-800 flex flex-col justify-between shadow-xl ${card.glow}
            `}
          >
            {/* Top row: Icon & Status Badge */}
            <div className="flex items-center justify-between mb-3">
              <div className={`p-3 rounded-xl border ${card.iconBg}`}>
                <Icon className="w-6 h-6" />
              </div>
              <span className={`px-2.5 py-1 text-[11px] font-bold rounded-full border border-slate-700/50 ${card.badgeColor}`}>
                {card.badge}
              </span>
            </div>

            {/* Middle row: Large Metric Value */}
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                {card.title}
              </p>
              <h3 className="text-3xl font-extrabold text-white tracking-tight">
                {card.value}
              </h3>
            </div>

            {/* Bottom row: Trend indicator */}
            <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center gap-1.5 text-xs text-slate-400">
              {card.trendUp ? (
                <TrendingUp className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              ) : (
                <TrendingDown className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              )}
              <span className="truncate">{card.trend}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
};
