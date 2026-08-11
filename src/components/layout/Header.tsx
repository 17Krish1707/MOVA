import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Bell, 
  Menu, 
  Clock, 
  SlidersHorizontal,
  ChevronDown,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import type { Incident } from '../../types/dashboard';

interface HeaderProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onToggleSidebar: () => void;
  incidents: Incident[];
}

export const Header: React.FC<HeaderProps> = ({
  searchQuery,
  setSearchQuery,
  onToggleSidebar,
  incidents,
}) => {
  const [time, setTime] = useState<string>('');
  const [showNotifications, setShowNotifications] = useState<boolean>(false);
  const [showProfileMenu, setShowProfileMenu] = useState<boolean>(false);

  // Live real-time clock for dispatch room monitoring
  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    };
    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  const activeIncidents = incidents.filter(i => !i.resolved);

  return (
    <header className="sticky top-0 z-30 h-20 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-4 lg:px-8 flex items-center justify-between gap-4">
      {/* Left side: Mobile menu toggle + Global Search bar */}
      <div className="flex items-center gap-4 flex-1 max-w-2xl">
        <button
          onClick={onToggleSidebar}
          className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg lg:hidden transition-colors"
          aria-label="Toggle menu"
        >
          <Menu className="w-6 h-6" />
        </button>

        {/* Global Search Bar */}
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
            <Search className="w-4 h-4 text-slate-400" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search tracking #, customer name, address, or driver..."
            className="w-full pl-10 pr-10 py-2.5 bg-slate-950/60 border border-slate-800 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-xs text-slate-400 hover:text-slate-200"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Right side: Hub clock, system status, notifications, dispatcher profile */}
      <div className="flex items-center gap-3 lg:gap-5">
        {/* Real-time Dispatch Clock */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-950/40 border border-slate-800/80 text-slate-300 text-xs font-mono">
          <Clock className="w-3.5 h-3.5 text-cyan-400" />
          <span>{time || '14:11:06'}</span>
          <span className="text-[10px] text-slate-500 font-sans">UTC+5:30</span>
        </div>

        {/* Hub Operations Readiness Indicator */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>Hub 04 Operational</span>
        </div>

        {/* Notifications Dropdown */}
        <div className="relative">
          <button
            onClick={() => {
              setShowNotifications(!showNotifications);
              setShowProfileMenu(false);
            }}
            className="relative p-2.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl border border-slate-800 transition-colors"
          >
            <Bell className="w-5 h-5" />
            {activeIncidents.length > 0 && (
              <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-rose-500 text-[11px] font-bold text-white shadow-lg shadow-rose-500/40">
                {activeIncidents.length}
              </span>
            )}
          </button>

          {/* Notifications Popover */}
          {showNotifications && (
            <div className="absolute right-0 mt-3 w-80 sm:w-96 rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl shadow-slate-950 p-4 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-400" />
                  <h4 className="font-bold text-sm text-slate-100">Live Incident Alerts</h4>
                </div>
                <span className="text-xs font-bold px-2 py-0.5 rounded bg-rose-500/20 text-rose-300">
                  {activeIncidents.length} Unresolved
                </span>
              </div>

              <div className="py-2 space-y-2 max-h-72 overflow-y-auto">
                {activeIncidents.length === 0 ? (
                  <p className="text-xs text-slate-400 text-center py-4">No active incidents reported.</p>
                ) : (
                  activeIncidents.map((incident) => (
                    <div key={incident.id} className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 hover:border-slate-700 transition-colors">
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="font-mono font-bold text-cyan-400">{incident.trackingCode}</span>
                        <span className="text-slate-400">{incident.timestamp}</span>
                      </div>
                      <p className="text-xs font-semibold text-slate-200">{incident.type}</p>
                      <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">{incident.description}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Dispatcher Profile Dropdown Menu */}
        <div className="relative">
          <button
            onClick={() => {
              setShowProfileMenu(!showProfileMenu);
              setShowNotifications(false);
            }}
            className="flex items-center gap-2.5 p-1.5 pl-2.5 rounded-xl border border-slate-800 hover:bg-slate-800/60 transition-colors"
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-xs font-bold text-white shadow-md shadow-cyan-500/20">
              SJ
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-xs font-bold text-slate-200 leading-tight">Sarah Jenkins</p>
              <p className="text-[10px] text-slate-400">Shift Manager</p>
            </div>
            <ChevronDown className="w-4 h-4 text-slate-400" />
          </button>

          {/* Profile Dropdown */}
          {showProfileMenu && (
            <div className="absolute right-0 mt-3 w-56 rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="px-3 py-2 border-b border-slate-800 mb-1">
                <p className="text-xs font-bold text-slate-100">Sarah Jenkins</p>
                <p className="text-[11px] text-slate-400">sarah.j@mova-logistics.io</p>
              </div>
              <div className="space-y-0.5">
                <button className="w-full text-left px-3 py-2 text-xs font-medium text-slate-300 hover:bg-slate-800 rounded-lg transition-colors">
                  Dispatcher Settings
                </button>
                <button className="w-full text-left px-3 py-2 text-xs font-medium text-slate-300 hover:bg-slate-800 rounded-lg transition-colors">
                  Shift History & Logs
                </button>
                <button className="w-full text-left px-3 py-2 text-xs font-medium text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors">
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
