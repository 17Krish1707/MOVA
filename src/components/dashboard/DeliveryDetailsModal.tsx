import React from 'react';
import type { Delivery } from '../../types/dashboard';
import { Badge } from '../common/Badge';
import { 
  X, 
  Package, 
  User, 
  MapPin, 
  Phone, 
  Clock, 
  Truck, 
  AlertCircle, 
  ShieldCheck, 
  FileText 
} from 'lucide-react';

interface DeliveryDetailsModalProps {
  delivery: Delivery | null;
  onClose: () => void;
}

export const DeliveryDetailsModal: React.FC<DeliveryDetailsModalProps> = ({
  delivery,
  onClose,
}) => {
  if (!delivery) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
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
              <h3 className="text-xl font-extrabold text-white font-mono mt-1">
                {delivery.trackingCode}
              </h3>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6 space-y-6">
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
                  <span>{delivery.eta}</span>
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
                      <p className="text-xs text-slate-400">Driver ID: {delivery.driverId}</p>
                    </div>
                    <span className="px-2.5 py-1 rounded bg-emerald-500/10 text-emerald-400 text-xs font-bold border border-emerald-500/20">
                      Dispatched
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <span className="text-amber-400 text-xs font-semibold">No driver currently assigned</span>
                    <button className="px-3 py-1 rounded-lg bg-amber-500 text-slate-950 font-bold text-xs hover:bg-amber-400 transition-colors">
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
                  <span className="font-mono text-slate-400">{delivery.createdAt}</span>
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
        <div className="p-6 border-t border-slate-800 bg-slate-950/60 flex items-center gap-3">
          <a
            href={`tel:${delivery.customerPhone}`}
            className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs text-center transition-colors flex items-center justify-center gap-2"
          >
            <Phone className="w-4 h-4" />
            Contact Customer
          </a>
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition-colors"
          >
            Close Panel
          </button>
        </div>
      </div>
    </div>
  );
};
