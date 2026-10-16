import React, { useState } from 'react';
import type { Delivery, DeliveryStatus } from '../../types/dashboard';
import { Badge } from '../common/Badge';
import { 
  Package, 
  MapPin, 
  Eye, 
  Clock, 
  Plus, 
  Edit3, 
  Trash2 
} from 'lucide-react';

interface DeliveriesTableProps {
  deliveries: Delivery[];
  onSelectDelivery: (delivery: Delivery) => void;
  onCreateDelivery?: () => void;
  onEditDelivery?: (delivery: Delivery) => void;
  onDeleteDelivery?: (delivery: Delivery) => void;
  searchQuery: string;
}

export const DeliveriesTable: React.FC<DeliveriesTableProps> = ({
  deliveries,
  onSelectDelivery,
  onCreateDelivery,
  onEditDelivery,
  onDeleteDelivery,
  searchQuery,
}) => {
  const [selectedFilter, setSelectedFilter] = useState<DeliveryStatus | 'all'>('all');

  // Filter deliveries based on tab selection and global search query
  const filteredDeliveries = deliveries.filter((item) => {
    const matchesFilter = selectedFilter === 'all' || item.status === selectedFilter;
    const matchesSearch = searchQuery === '' ||
      item.trackingCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.destinationAddress.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.destinationCity.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.driverName && item.driverName.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesFilter && matchesSearch;
  });

  const filterTabs: { id: DeliveryStatus | 'all'; label: string; count: number }[] = [
    { id: 'all', label: 'All Orders', count: deliveries.length },
    { id: 'in_transit', label: 'In Transit', count: deliveries.filter(d => d.status === 'in_transit').length },
    { id: 'pending', label: 'Pending Dispatch', count: deliveries.filter(d => d.status === 'pending').length },
    { id: 'delayed', label: 'Delayed', count: deliveries.filter(d => d.status === 'delayed').length },
    { id: 'delivered', label: 'Delivered', count: deliveries.filter(d => d.status === 'delivered').length },
    { id: 'cancelled', label: 'Cancelled', count: deliveries.filter(d => d.status === 'cancelled').length },
  ];

  const formatEta = (etaStr: string) => {
    const d = new Date(etaStr);
    if (isNaN(d.getTime())) return etaStr;
    return d.toLocaleString([], { 
      month: 'short', 
      day: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <div className="glass-panel rounded-2xl border border-slate-800 p-6 shadow-xl mb-8">
      {/* Header title & actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <Package className="w-5 h-5 text-cyan-400" />
            <h2 className="text-lg font-extrabold text-white tracking-tight">Recent Deliveries</h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Real-time delivery status, driver assignments, and ETA updates
          </p>
        </div>

        {/* Action Controls: Status Filters + Create Delivery Button */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Status Pill Filters */}
          <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-950/80 rounded-xl border border-slate-800">
            {filterTabs.map((tab) => {
              const isActive = selectedFilter === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setSelectedFilter(tab.id)}
                  className={`
                    px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5
                    ${isActive
                      ? 'bg-cyan-500 text-slate-950 font-bold shadow-md shadow-cyan-500/20'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'}
                  `}
                >
                  <span>{tab.label}</span>
                  <span className={`px-1.5 py-0.2 text-[10px] rounded-full ${isActive ? 'bg-slate-950/30 text-slate-950' : 'bg-slate-800 text-slate-400'}`}>
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Create Delivery Action Button */}
          {onCreateDelivery && (
            <button
              onClick={onCreateDelivery}
              className="px-3.5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition-colors flex items-center gap-2 shadow-lg shadow-cyan-500/20 shrink-0"
              title="Create new delivery order"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Create Delivery</span>
            </button>
          )}
        </div>
      </div>

      {/* Deliveries Table Container */}
      <div className="overflow-x-auto rounded-xl border border-slate-800/80">
        <table className="w-full text-left border-collapse text-sm">
          <thead>
            <tr className="bg-slate-950/60 text-slate-400 text-xs font-bold uppercase tracking-wider border-b border-slate-800">
              <th className="py-3.5 px-4">Tracking Code</th>
              <th className="py-3.5 px-4">Customer & Destination</th>
              <th className="py-3.5 px-4">Assigned Driver</th>
              <th className="py-3.5 px-4">Priority</th>
              <th className="py-3.5 px-4">Status</th>
              <th className="py-3.5 px-4">ETA</th>
              <th className="py-3.5 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 bg-slate-900/30">
            {filteredDeliveries.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-slate-500 text-sm">
                  No matching deliveries found. Try adjusting your filters or search query.
                </td>
              </tr>
            ) : (
              filteredDeliveries.map((delivery) => (
                <tr
                  key={delivery.id}
                  className="hover:bg-slate-800/50 transition-colors group cursor-pointer"
                  onClick={() => onSelectDelivery(delivery)}
                >
                  {/* Tracking Code & Package Count */}
                  <td className="py-4 px-4 font-mono">
                    <div className="font-bold text-cyan-400 group-hover:text-cyan-300">
                      {delivery.trackingCode}
                    </div>
                    <div className="text-[11px] text-slate-500 font-sans">
                      {delivery.packagesCount} package(s) • {delivery.weightKg} kg
                    </div>
                  </td>

                  {/* Customer Name & Address */}
                  <td className="py-4 px-4">
                    <div className="font-semibold text-slate-100">{delivery.customerName}</div>
                    <div className="flex items-center gap-1 text-xs text-slate-400 mt-0.5 truncate max-w-xs">
                      <MapPin className="w-3 h-3 text-slate-500 shrink-0" />
                      <span className="truncate">{delivery.destinationAddress}, {delivery.destinationCity}</span>
                    </div>
                  </td>

                  {/* Driver Name or Unassigned */}
                  <td className="py-4 px-4">
                    {delivery.driverName ? (
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-bold text-cyan-300">
                          {delivery.driverName.charAt(0)}
                        </div>
                        <span className="font-medium text-slate-200">{delivery.driverName}</span>
                      </div>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-1 rounded bg-amber-500/10 text-amber-400 text-xs font-semibold border border-amber-500/20">
                        Unassigned
                      </span>
                    )}
                  </td>

                  {/* Priority Tag */}
                  <td className="py-4 px-4">
                    <Badge type="priority" value={delivery.priority} />
                  </td>

                  {/* Status Badge */}
                  <td className="py-4 px-4">
                    <Badge type="status" value={delivery.status} />
                  </td>

                  {/* ETA */}
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-1.5 text-xs text-slate-300 font-medium">
                      <Clock className="w-3.5 h-3.5 text-slate-500" />
                      <span>{formatEta(delivery.eta)}</span>
                    </div>
                  </td>

                  {/* Action Buttons: Details, Edit, Delete */}
                  <td className="py-4 px-4 text-right">
                    <div className="inline-flex items-center gap-1.5">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectDelivery(delivery);
                        }}
                        className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-cyan-500 text-slate-300 hover:text-slate-950 transition-colors inline-flex items-center gap-1 text-xs font-bold"
                        title="View Manifest Details"
                        aria-label="View details"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Details</span>
                      </button>

                      {onEditDelivery && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onEditDelivery(delivery);
                          }}
                          className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-cyan-300 transition-colors"
                          title="Edit Delivery"
                          aria-label="Edit delivery"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                      )}

                      {onDeleteDelivery && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteDelivery(delivery);
                          }}
                          className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 transition-colors"
                          title="Delete Delivery"
                          aria-label="Delete delivery"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
