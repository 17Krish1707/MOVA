import React from 'react';
import { DeliveryForm } from './DeliveryForm';
import type { Driver } from '../../types/dashboard';
import type { CreateDeliveryInput, UpdateDeliveryInput } from '../../api/deliveryApi';
import { X, PackagePlus } from 'lucide-react';

interface CreateDeliveryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateDeliveryInput | UpdateDeliveryInput) => Promise<void>;
  isSubmitting: boolean;
  serverError?: string | null;
  availableDrivers?: Driver[];
}

export const CreateDeliveryModal: React.FC<CreateDeliveryModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  isSubmitting,
  serverError,
  availableDrivers = [],
}) => {
  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="create-delivery-title"
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
              <PackagePlus className="w-5 h-5" />
            </div>
            <div>
              <h3 id="create-delivery-title" className="text-lg font-bold text-white tracking-tight">
                Create Delivery Order
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Register a new parcel dispatch into MOVA real-time telematics
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
            mode="create"
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
