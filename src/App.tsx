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
import { CreateDeliveryModal } from './components/dashboard/CreateDeliveryModal';
import { EditDeliveryModal } from './components/dashboard/EditDeliveryModal';
import { DeleteConfirmationDialog } from './components/dashboard/DeleteConfirmationDialog';
import { NotificationToast, type ToastMessage } from './components/common/NotificationToast';

import { 
  getDeliveries, 
  createDelivery, 
  updateDelivery, 
  deleteDelivery 
} from './api';
import type { CreateDeliveryInput, UpdateDeliveryInput } from './api/deliveryApi';
import type { 
  NavigationTab, 
  Delivery, 
  DeliveryStatus,
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

  // Delivery data state
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Interactive modal management states
  const [selectedDelivery, setSelectedDelivery] = useState<Delivery | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [editingDelivery, setEditingDelivery] = useState<Delivery | null>(null);
  const [deletingDelivery, setDeletingDelivery] = useState<Delivery | null>(null);

  // Mutation UX state (submitting, error, toast feedback)
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [mutationError, setMutationError] = useState<string | null>(null);
  const [toast, setToast] = useState<ToastMessage | null>(null);

  // Local static telematics state
  const [drivers] = useState<Driver[]>(MOCK_DRIVERS);
  const [vehicles] = useState<Vehicle[]>(MOCK_VEHICLES);
  const [routes] = useState<Route[]>(MOCK_ROUTES);
  const [incidents, setIncidents] = useState<Incident[]>(MOCK_INCIDENTS);
  const [stats, setStats] = useState<DashboardStats>(INITIAL_STATS);

  // Initial fetch of delivery manifests from the backend API
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

  // Update dynamic dashboard stats when deliveries array changes
  useEffect(() => {
    const pendingCount = deliveries.filter((d) => d.status === 'pending').length;
    const activeCount = deliveries.filter((d) => d.status === 'in_transit').length;
    const delayedCount = deliveries.filter((d) => d.status === 'delayed').length;

    setStats((prev) => ({
      ...prev,
      pendingOrders: pendingCount,
      activeDeliveries: activeCount,
      delayedDeliveries: delayedCount,
    }));
  }, [deliveries]);

  // MUTATION 1: CREATE DELIVERY
  const handleCreateDelivery = async (input: CreateDeliveryInput | UpdateDeliveryInput) => {
    try {
      setIsSubmitting(true);
      setMutationError(null);

      // Call authoritative backend POST /api/deliveries endpoint
      const created = await createDelivery(input as CreateDeliveryInput);

      // Immutable React state update: prepend newly created document from MongoDB
      setDeliveries((prev) => [created, ...prev]);

      setIsCreateModalOpen(false);
      setToast({
        type: 'success',
        title: 'Dispatch Order Created',
        message: `Manifest ${created.trackingCode} registered and synced to MongoDB.`,
      });
    } catch (err: unknown) {
      console.error('Create delivery error:', err);
      const message = err instanceof Error ? err.message : 'Failed to create delivery order.';
      setMutationError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // MUTATION 2: EDIT DELIVERY (PARTIAL/FULL VIA PATCH)
  const handleUpdateDelivery = async (input: CreateDeliveryInput | UpdateDeliveryInput) => {
    if (!editingDelivery) return;

    try {
      setIsSubmitting(true);
      setMutationError(null);

      // Call authoritative backend PATCH /api/deliveries/:id endpoint
      const updated = await updateDelivery(editingDelivery.id, input);

      // Immutable React state update: replace matching delivery in array
      setDeliveries((prev) =>
        prev.map((item) => (item.id === updated.id ? updated : item))
      );

      // Keep slide-over manifest synchronized if open
      if (selectedDelivery && selectedDelivery.id === updated.id) {
        setSelectedDelivery(updated);
      }

      setEditingDelivery(null);
      setToast({
        type: 'success',
        title: 'Delivery Manifest Updated',
        message: `Order ${updated.trackingCode} updated in MongoDB.`,
      });
    } catch (err: unknown) {
      console.error('Update delivery error:', err);
      const message = err instanceof Error ? err.message : 'Failed to update delivery.';
      setMutationError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // MUTATION 3: DELIVERY STATUS CHANGE (PATCH ONLY STATUS)
  const handleStatusChange = async (id: string, newStatus: DeliveryStatus): Promise<void> => {
    // Call PATCH /api/deliveries/:id with status payload only
    const updated = await updateDelivery(id, { status: newStatus });

    // Immutable React state update
    setDeliveries((prev) =>
      prev.map((item) => (item.id === updated.id ? updated : item))
    );

    // Keep active manifest synchronized
    if (selectedDelivery && selectedDelivery.id === updated.id) {
      setSelectedDelivery(updated);
    }

    setToast({
      type: 'success',
      title: 'Status Synchronized',
      message: `Manifest ${updated.trackingCode} is now "${newStatus.replace('_', ' ')}".`,
    });
  };

  // MUTATION 4: DELETE DELIVERY (WITH CONFIRMATION DIALOG)
  const handleDeleteDelivery = async () => {
    if (!deletingDelivery) return;

    try {
      setIsSubmitting(true);
      setMutationError(null);

      // Call backend DELETE /api/deliveries/:id endpoint
      await deleteDelivery(deletingDelivery.id);

      // Immutable React state update: filter out the deleted item
      setDeliveries((prev) => prev.filter((item) => item.id !== deletingDelivery.id));

      // Close details panel if the deleted item was currently open
      if (selectedDelivery && selectedDelivery.id === deletingDelivery.id) {
        setSelectedDelivery(null);
      }

      const deletedCode = deletingDelivery.trackingCode;
      setDeletingDelivery(null);
      setToast({
        type: 'success',
        title: 'Delivery Deleted',
        message: `Order ${deletedCode} permanently removed from MongoDB.`,
      });
    } catch (err: unknown) {
      console.error('Delete delivery error:', err);
      const message = err instanceof Error ? err.message : 'Failed to delete delivery.';
      setMutationError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Helper to mark incident resolved
  const handleResolveIncident = (id: string) => {
    setIncidents((prev) =>
      prev.map((inc) => (inc.id === id ? { ...inc, resolved: true } : inc))
    );
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex font-sans antialiased">
      {/* Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        pendingOrdersCount={stats.pendingOrders}
        incidentsCount={incidents.filter((i) => !i.resolved).length}
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
                  onCreateDelivery={() => {
                    setMutationError(null);
                    setIsCreateModalOpen(true);
                  }}
                  onEditDelivery={(delivery) => {
                    setMutationError(null);
                    setEditingDelivery(delivery);
                  }}
                  onDeleteDelivery={(delivery) => {
                    setMutationError(null);
                    setDeletingDelivery(delivery);
                  }}
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
                onCreateDelivery={() => {
                  setMutationError(null);
                  setIsCreateModalOpen(true);
                }}
                onEditDelivery={(delivery) => {
                  setMutationError(null);
                  setEditingDelivery(delivery);
                }}
                onDeleteDelivery={(delivery) => {
                  setMutationError(null);
                  setDeletingDelivery(delivery);
                }}
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

      {/* 1. Slide-over Order Manifest Drawer */}
      <DeliveryDetailsModal
        delivery={selectedDelivery}
        onClose={() => setSelectedDelivery(null)}
        onEdit={(delivery) => {
          setMutationError(null);
          setEditingDelivery(delivery);
        }}
        onDelete={(delivery) => {
          setMutationError(null);
          setDeletingDelivery(delivery);
        }}
        onStatusChange={handleStatusChange}
      />

      {/* 2. Create Delivery Modal */}
      <CreateDeliveryModal
        isOpen={isCreateModalOpen}
        onClose={() => {
          setIsCreateModalOpen(false);
          setMutationError(null);
        }}
        onSubmit={handleCreateDelivery}
        isSubmitting={isSubmitting}
        serverError={mutationError}
        availableDrivers={drivers}
      />

      {/* 3. Edit Delivery Modal */}
      <EditDeliveryModal
        delivery={editingDelivery}
        isOpen={editingDelivery !== null}
        onClose={() => {
          setEditingDelivery(null);
          setMutationError(null);
        }}
        onSubmit={handleUpdateDelivery}
        isSubmitting={isSubmitting}
        serverError={mutationError}
        availableDrivers={drivers}
      />

      {/* 4. Delete Confirmation Dialog */}
      <DeleteConfirmationDialog
        isOpen={deletingDelivery !== null}
        delivery={deletingDelivery}
        onConfirm={handleDeleteDelivery}
        onCancel={() => {
          setDeletingDelivery(null);
          setMutationError(null);
        }}
        isDeleting={isSubmitting}
        error={mutationError}
      />

      {/* 5. Notification Toast for Mutation Results */}
      <NotificationToast
        toast={toast}
        onClose={() => setToast(null)}
      />
    </div>
  );
};

export default App;
