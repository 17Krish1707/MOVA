import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { StatCards } from './components/dashboard/StatCards';
import { DeliveriesTable } from './components/dashboard/DeliveriesTable';
import { DriverStatus } from './components/dashboard/DriverStatus';
import { VehiclesView } from './components/dashboard/VehiclesView';
import { RoutesView } from './components/dashboard/RoutesView';
import { IncidentsView } from './components/dashboard/IncidentsView';
import { DeliveryDetailsModal } from './components/dashboard/DeliveryDetailsModal';

import { getDeliveries } from './api';
import type { 
  NavigationTab, 
  Delivery, 
  Driver, 
  Vehicle, 
  Route, 
  Incident, 
  DashboardStats 
} from './types/dashboard';

import { 
  MOCK_DRIVERS, 
  MOCK_VEHICLES, 
  MOCK_ROUTES, 
  MOCK_INCIDENTS, 
  INITIAL_STATS 
} from './data/mockData';

export const App: React.FC = () => {
  // Navigation & UI state
  const [activeTab, setActiveTab] = useState<NavigationTab>('overview');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState<boolean>(false);
  const [selectedDelivery, setSelectedDelivery] = useState<Delivery | null>(null);

  // Local dashboard static state
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [drivers, setDrivers] = useState<Driver[]>(MOCK_DRIVERS);
  const [vehicles] = useState<Vehicle[]>(MOCK_VEHICLES);
  const [routes] = useState<Route[]>(MOCK_ROUTES);
  const [incidents, setIncidents] = useState<Incident[]>(MOCK_INCIDENTS);
  const [stats] = useState<DashboardStats>(INITIAL_STATS);

  // Fetch real delivery data from the API service
  useEffect(() => {
    const fetchDeliveries = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await getDeliveries();
        setDeliveries(data);
      } catch (err: unknown) {
        console.error('Failed to fetch deliveries:', err);
        const message = err instanceof Error ? err.message : 'Failed to connect to the dispatch server.';
        setError(message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDeliveries();
  }, []);

  // Helper to mark incident resolved
  const handleResolveIncident = (id: string) => {
    setIncidents(prev => prev.map(inc => inc.id === id ? { ...inc, resolved: true } : inc));
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex font-sans antialiased">
      {/* Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        pendingOrdersCount={stats.pendingOrders}
        incidentsCount={incidents.filter(i => !i.resolved).length}
        isOpen={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-64">
        {/* Top Sticky Header */}
        <Header
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          onToggleSidebar={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
          incidents={incidents}
        />

        {/* Dynamic Main Workspace Container */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-6">
          {/* Active Navigation Context Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-800/80">
            <div>
              <h1 className="text-2xl font-extrabold tracking-tight text-white capitalize">
                {activeTab === 'overview' ? 'Dispatcher Control Room' : `${activeTab} Management`}
              </h1>
              <p className="text-xs text-slate-400 mt-1">
                MOVA Last-Mile Operations Hub • Dynamic Fleet & Route Coordination
              </p>
            </div>
            
            {/* Quick Status Pill */}
            <div className="flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 self-start sm:self-auto">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
              <span className="text-slate-300">Live Telematics Sync</span>
            </div>
          </div>

          {/* Conditional View Rendering based on activeTab */}
          {activeTab === 'overview' && (
            <>
              {/* Key Metrics Cards */}
              <StatCards stats={stats} />

              {/* Deliveries Table */}
              {isLoading ? (
                <div className="flex flex-col items-center justify-center p-8 bg-slate-900 border border-slate-800 rounded-xl space-y-3">
                  <div className="w-8 h-8 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
                  <p className="text-slate-400 text-sm">Loading delivery telemetry...</p>
                </div>
              ) : error ? (
                <div className="p-4 bg-red-950/40 border border-red-900/50 rounded-xl text-center">
                  <p className="text-red-400 text-sm font-semibold">Failed to connect to Dispatch server</p>
                  <p className="text-red-300/80 text-xs mt-1">{error}</p>
                </div>
              ) : (
                <DeliveriesTable
                  deliveries={deliveries}
                  onSelectDelivery={(delivery) => setSelectedDelivery(delivery)}
                  searchQuery={searchQuery}
                />
              )}

              {/* Driver Status Fleet Overview */}
              <DriverStatus drivers={drivers} />
            </>
          )}

          {activeTab === 'orders' && (
            isLoading ? (
              <div className="flex flex-col items-center justify-center p-8 bg-slate-900 border border-slate-800 rounded-xl space-y-3">
                <div className="w-8 h-8 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-slate-400 text-sm">Loading delivery telemetry...</p>
              </div>
            ) : error ? (
              <div className="p-4 bg-red-950/40 border border-red-900/50 rounded-xl text-center">
                <p className="text-red-400 text-sm font-semibold">Failed to connect to Dispatch server</p>
                <p className="text-red-300/80 text-xs mt-1">{error}</p>
              </div>
            ) : (
              <DeliveriesTable
                deliveries={deliveries}
                onSelectDelivery={(delivery) => setSelectedDelivery(delivery)}
                searchQuery={searchQuery}
              />
            )
          )}

          {activeTab === 'drivers' && (
            <DriverStatus drivers={drivers} />
          )}

          {activeTab === 'vehicles' && (
            <VehiclesView vehicles={vehicles} />
          )}

          {activeTab === 'routes' && (
            <RoutesView routes={routes} />
          )}

          {activeTab === 'incidents' && (
            <IncidentsView 
              incidents={incidents} 
              onResolveIncident={handleResolveIncident} 
            />
          )}
        </main>
      </div>

      {/* Delivery Manifest Side Drawer Modal */}
      <DeliveryDetailsModal
        delivery={selectedDelivery}
        onClose={() => setSelectedDelivery(null)}
      />
    </div>
  );
};

export default App;
