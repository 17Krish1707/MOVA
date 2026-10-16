import React, { useState } from 'react';
import type { Delivery, DeliveryStatus } from '../../types/dashboard';
import { Badge } from '../common/Badge';
import { 
  X, 
  Package, 
  User, 
  MapPin, 
  Phone, 
  Clock, 
  Truck, 
  Edit3, 
  Trash2, 
  Activity, 
  Loader2 
} from 'lucide-react';

interface DeliveryDetailsModalProps {
  delivery: Delivery | null;
  onClose: () => void;
  onEdit: (delivery: Delivery) => void;
  onDelete: (delivery: Delivery) => void;
  onStatusChange: (id: string, status: DeliveryStatus) => Promise<void>;
}

export const DeliveryDetailsModal: React.FC<DeliveryDetailsModalProps> = ({
  delivery,
  onClose,
  onEdit,
  onDelete,
  onStatusChange,
}) => {
  const [isUpdatingStatus, setIsUpdatingStatus] = useState<boolean>(false);
  const [statusError, setStatusError] = useState<string | null>(null);

  if (!delivery) return null;

  const handleStatusSelect = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = e.target.value as DeliveryStatus;
    if (newStatus === delivery.status) return;

    try {
      setIsUpdatingStatus(true);
      setStatusError(null);
      await onStatusChange(delivery.id, newStatus);
    } catch (err: unknown) {
      console.error('Failed to update status:', err);
      const msg = err instanceof Error ? err.message : 'Failed to update delivery status.';
      setStatusError(msg);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  return (
    <div 
      role="dialog"
      aria-modal="true"
      aria-labelledby="delivery-manifest-title"
      className="fixed inset-0 z-50 flex justify-end bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      {/* Slide-over panel */}
      <div 
        className="w-full max-w-lg bg-slate-900 border-l border-slate-800 h-full flex flex-col justify-between shadow-2xl overflow-y-auto animate-in slide-in-from-right duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        <div>
          {/* Header */}
          <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-950/40">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-extrabold uppercase tracking-wider text-cyan-400">Order Manifest</span>
                <Badge type="status" value={delivery.status} size="sm" />
              </div>
              <h3 id="delivery-manifest-title" className="text-xl font-extrabold text-white font-mono mt-1">
                {delivery.trackingCode}
              </h3>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => onEdit(delivery)}
                className="p-2 rounded-xl text-slate-400 hover:text-cyan-300 hover:bg-slate-800 transition-colors"
                title="Edit delivery details"
                aria-label="Edit delivery"
              >
                <Edit3 className="w-4 h-4" />
              </button>
              <button
                onClick={() => onDelete(delivery)}
                className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                title="Delete delivery"
                aria-label="Delete delivery"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              <button
                onClick={onClose}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                aria-label="Close manifest"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="p-6 space-y-6">
            {/* Quick Dispatcher Status Updater */}
            <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800/90 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] uppercase tracking-wider font-bold text-slate-400 flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-cyan-400" />
                  Quick Status Control
                </span>
                {isUpdatingStatus && (
                  <span className="text-[11px] text-cyan-400 flex items-center gap-1 font-semibold">
                    <Loader2 className="w-3 h-3 animate-spin" />
                    Updating MongoDB...
                  </span>
                )}
              </div>

              <div className="flex items-center gap-3">
                <select
                  value={delivery.status}
                  onChange={handleStatusSelect}
                  disabled={isUpdatingStatus}
                  className="flex-1 px-3 py-2 bg-slate-900 border border-slate-700/80 rounded-xl text-xs font-semibold text-white focus:outline-none focus:border-cyan-500 disabled:opacity-60 transition-all"
                >
                  <option value="pending">⏳ Pending Dispatch</option>
                  <option value="in_transit">🚚 In Transit</option>
                  <option value="delayed">⚠️ Delayed</option>
                  <option value="delivered">✅ Delivered</option>
                  <option value="cancelled">🚫 Cancelled</option>
                </select>
              </div>

              {statusError && (
                <p className="text-[11px] text-rose-400 font-medium pt-1">{statusError}</p>
              )}
            </div>

            {/* Priority & Delivery Time */}
            <div className="grid grid-cols-2 gap-3 p-4 rounded-xl bg-slate-950/60 border border-slate-800">
              <div>
                <span className="text-[11px] uppercase tracking-wider font-bold text-slate-500">Priority Level</span>
                <div className="mt-1">
                  <Badge type="priority" value={delivery.priority} />
                </div>
              </div>
              <div>
                <span className="text-[11px] uppercase tracking-wider font-bold text-slate-500">Estimated Arrival</span>
                <div className="flex items-center gap-1.5 mt-1 text-sm font-semibold text-slate-200">
                  <Clock className="w-4 h-4 text-cyan-400" />
                  <span>{new Date(delivery.eta).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' }) !== 'Invalid Date' ? new Date(delivery.eta).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' }) : delivery.eta}</span>
                </div>
              </div>
            </div>

            {/* Customer & Address Details */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                <User className="w-4 h-4 text-cyan-400" />
                Customer Contact
              </h4>
              <div className="p-4 rounded-xl bg-slate-950/40 border border-slate-800 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-400">Customer Name:</span>
                  <span className="font-semibold text-slate-100">{delivery.customerName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Phone Number:</span>
                  <a href={`tel:${delivery.customerPhone}`} className="font-mono text-cyan-400 hover:underline">
                    {delivery.customerPhone}
                  </a>
                </div>
                <div className="pt-2 border-t border-slate-800/80">
                  <span className="text-xs text-slate-400 block mb-1">Destination Address:</span>
                  <div className="flex items-start gap-1.5 text-xs text-slate-200">
                    <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                    <span>{delivery.destinationAddress}, {delivery.destinationCity}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Assigned Driver Details */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                <Truck className="w-4 h-4 text-emerald-400" />
                Assigned Logistics Unit
              </h4>
              <div className="p-4 rounded-xl bg-slate-950/40 border border-slate-800 text-sm">
                {delivery.driverName ? (
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-bold text-slate-100">{delivery.driverName}</p>
                      {delivery.driverId && (
                        <p className="text-xs text-slate-400">Driver ID: {delivery.driverId}</p>
                      )}
                    </div>
                    <span className="px-2.5 py-1 rounded bg-emerald-500/10 text-emerald-400 text-xs font-bold border border-emerald-500/20">
                      Dispatched
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <span className="text-amber-400 text-xs font-semibold">No driver currently assigned</span>
                    <button
                      onClick={() => onEdit(delivery)}
                      className="px-3 py-1 rounded-lg bg-amber-500 text-slate-950 font-bold text-xs hover:bg-amber-400 transition-colors"
                    >
                      Assign Driver
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Parcel Manifest */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                <Package className="w-4 h-4 text-indigo-400" />
                Parcel Manifest
              </h4>
              <div className="p-4 rounded-xl bg-slate-950/40 border border-slate-800 space-y-2 text-xs">
                <div className="flex justify-between text-slate-300">
                  <span>Packages Count:</span>
                  <span className="font-bold text-white">{delivery.packagesCount} items</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>Gross Weight:</span>
                  <span className="font-bold text-white">{delivery.weightKg} kg</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>Order Created:</span>
                  <span className="font-mono text-slate-400">
                    {new Date(delivery.createdAt).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' }) !== 'Invalid Date'
                      ? new Date(delivery.createdAt).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })
                      : delivery.createdAt}
                  </span>
                </div>
                {delivery.notes && (
                  <div className="pt-2 border-t border-slate-800/80">
                    <span className="text-slate-400 font-medium block mb-1">Dispatcher Notes:</span>
                    <p className="p-2.5 rounded-lg bg-slate-950 text-slate-300 text-xs italic border border-slate-800">
                      "{delivery.notes}"
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t border-slate-800 bg-slate-950/60 flex items-center gap-2.5">
          <button
            onClick={() => onEdit(delivery)}
            className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition-colors flex items-center justify-center gap-2"
          >
            <Edit3 className="w-3.5 h-3.5 text-cyan-400" />
            Edit Order
          </button>

          <button
            onClick={() => onDelete(delivery)}
            className="py-2.5 px-3 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 font-bold text-xs transition-colors flex items-center justify-center gap-1.5"
            title="Delete this delivery"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Delete
          </button>

          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
