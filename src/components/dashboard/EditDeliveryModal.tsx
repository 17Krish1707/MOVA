import React from 'react';
import { DeliveryForm } from './DeliveryForm';
import type { Delivery, Driver } from '../../types/dashboard';
import type { CreateDeliveryInput, UpdateDeliveryInput } from '../../api/deliveryApi';
import { X, Edit3 } from 'lucide-react';

interface EditDeliveryModalProps {
  delivery: Delivery | null;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateDeliveryInput | UpdateDeliveryInput) => Promise<void>;
  isSubmitting: boolean;
  serverError?: string | null;
  availableDrivers?: Driver[];
}

export const EditDeliveryModal: React.FC<EditDeliveryModalProps> = ({
  delivery,
  isOpen,
  onClose,
  onSubmit,
  isSubmitting,
  serverError,
  availableDrivers = [],
}) => {
  if (!isOpen || !delivery) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="edit-delivery-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200"
    >
      <div
        className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-6 border-b border-slate-800 bg-slate-950/40 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
              <Edit3 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 id="edit-delivery-title" className="text-lg font-bold text-white tracking-tight">
                  Edit Delivery Order
                </h3>
                <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300">
                  {delivery.trackingCode}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Modify delivery parameters, destination, or assigned driver
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors disabled:opacity-50"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <div className="p-6 overflow-y-auto">
          <DeliveryForm
            mode="edit"
            initialData={{
              trackingCode: delivery.trackingCode,
              customerName: delivery.customerName,
              customerPhone: delivery.customerPhone,
              destinationAddress: delivery.destinationAddress,
              destinationCity: delivery.destinationCity,
              driverId: delivery.driverId,
              driverName: delivery.driverName,
              status: delivery.status,
              priority: delivery.priority,
              eta: delivery.eta,
              packagesCount: delivery.packagesCount,
              weightKg: delivery.weightKg,
              notes: delivery.notes,
            }}
            onSubmit={onSubmit}
            onCancel={onClose}
            isSubmitting={isSubmitting}
            serverError={serverError}
            availableDrivers={availableDrivers}
          />
        </div>
      </div>
    </div>
  );
};
