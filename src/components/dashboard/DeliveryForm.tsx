import React, { useState } from 'react';
import type { 
  DeliveryStatus, 
  PriorityLevel, 
  Driver 
} from '../../types/dashboard';
import type { CreateDeliveryInput, UpdateDeliveryInput } from '../../api/deliveryApi';
import { 
  Package, 
  User, 
  MapPin, 
  Clock, 
  Truck, 
  FileText, 
  AlertCircle, 
  Loader2, 
  RefreshCw 
} from 'lucide-react';

interface DeliveryFormProps {
  initialData?: Partial<CreateDeliveryInput>;
  mode: 'create' | 'edit';
  onSubmit: (data: CreateDeliveryInput | UpdateDeliveryInput) => Promise<void>;
  onCancel: () => void;
  isSubmitting: boolean;
  serverError?: string | null;
  availableDrivers?: Driver[];
}

/**
 * Format a Date or ISO string into YYYY-MM-DDTHH:mm for datetime-local input
 */
function toDatetimeLocalString(dateStr?: string): string {
  if (!dateStr) {
    // Default to +4 hours from now
    const d = new Date(Date.now() + 4 * 60 * 60 * 1000);
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  }

  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return '';
  const pad = (n: number) => n.toString().padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

/**
 * Generate a collision-resistant MOVA tracking code format: MOV-XXXX-XXXX
 * Combines high-resolution timestamp entropy with random alphanumeric characters.
 */
function generateTrackingCode(): string {
  const chars = '0123456789ABCDEFGHJKLMNPQRSTUVWXYZ';
  const timePart = Date.now().toString(36).slice(-4).toUpperCase();
  let randomPart = '';

  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    const bytes = new Uint8Array(4);
    crypto.getRandomValues(bytes);
    for (let i = 0; i < 4; i++) {
      randomPart += chars[bytes[i] % chars.length];
    }
  } else {
    for (let i = 0; i < 4; i++) {
      randomPart += chars[Math.floor(Math.random() * chars.length)];
    }
  }

  return `MOV-${timePart}-${randomPart}`;
}

export const DeliveryForm: React.FC<DeliveryFormProps> = ({
  initialData,
  mode,
  onSubmit,
  onCancel,
  isSubmitting,
  serverError,
  availableDrivers = [],
}) => {
  // Controlled React form state with case and whitespace normalization
  const [trackingCode, setTrackingCode] = useState<string>(
    initialData?.trackingCode?.trim().toUpperCase() || (mode === 'create' ? generateTrackingCode() : '')
  );
  const [customerName, setCustomerName] = useState<string>(initialData?.customerName || '');
  const [customerPhone, setCustomerPhone] = useState<string>(initialData?.customerPhone || '');
  const [destinationAddress, setDestinationAddress] = useState<string>(initialData?.destinationAddress || '');
  const [destinationCity, setDestinationCity] = useState<string>(initialData?.destinationCity || '');
  const [driverId, setDriverId] = useState<string>(initialData?.driverId || '');
  const [status, setStatus] = useState<DeliveryStatus>(initialData?.status || 'pending');
  const [priority, setPriority] = useState<PriorityLevel>(initialData?.priority || 'normal');
  const [eta, setEta] = useState<string>(toDatetimeLocalString(initialData?.eta));
  const [packagesCount, setPackagesCount] = useState<number>(initialData?.packagesCount ?? 1);
  const [weightKg, setWeightKg] = useState<number>(initialData?.weightKg ?? 2.5);
  const [notes, setNotes] = useState<string>(initialData?.notes || '');

  // Validation error state
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Client-side validation prior to sending API payload
  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!trackingCode.trim()) {
      newErrors.trackingCode = 'Tracking code is required';
    }
    if (!customerName.trim()) {
      newErrors.customerName = 'Customer name is required';
    }
    if (!customerPhone.trim()) {
      newErrors.customerPhone = 'Customer phone is required';
    }
    if (!destinationAddress.trim()) {
      newErrors.destinationAddress = 'Destination address is required';
    }
    if (!destinationCity.trim()) {
      newErrors.destinationCity = 'Destination city is required';
    }
    if (!eta) {
      newErrors.eta = 'Estimated arrival time is required';
    }
    if (!packagesCount || packagesCount < 1) {
      newErrors.packagesCount = 'Packages count must be at least 1';
    }
    if (weightKg === undefined || weightKg < 0) {
      newErrors.weightKg = 'Weight must be 0 or greater';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    // Resolve assigned driver object
    const selectedDriver = availableDrivers.find((d) => d.id === driverId);

    // Convert datetime-local string to ISO Date string for backend schema compatibility
    const isoEta = eta ? new Date(eta).toISOString() : new Date().toISOString();

    const normalizedTrackingCode = trackingCode.trim().toUpperCase();

    const payload: CreateDeliveryInput = {
      trackingCode: normalizedTrackingCode,
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim(),
      destinationAddress: destinationAddress.trim(),
      destinationCity: destinationCity.trim(),
      driverId: driverId ? driverId : null,
      driverName: selectedDriver ? selectedDriver.name : null,
      status,
      priority,
      eta: isoEta,
      packagesCount: Number(packagesCount),
      weightKg: Number(weightKg),
      notes: notes.trim() || undefined,
    };

    await onSubmit(payload);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6" noValidate>
      {/* Server Error Alert Banner */}
      {serverError && (
        <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-900/60 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
          <div className="flex-1 text-xs">
            <h4 className="font-bold text-rose-300">Submission Error</h4>
            <p className="text-rose-200/90 mt-0.5 leading-relaxed">{serverError}</p>
          </div>
        </div>
      )}

      {/* Primary Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Tracking Code */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label htmlFor="trackingCode" className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <Package className="w-3.5 h-3.5 text-cyan-400" />
              Tracking Code *
            </label>
            {mode === 'create' && (
              <button
                type="button"
                onClick={() => setTrackingCode(generateTrackingCode())}
                className="text-[11px] text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-semibold"
              >
                <RefreshCw className="w-3 h-3" />
                Regenerate
              </button>
            )}
          </div>
          <input
            id="trackingCode"
            type="text"
            value={trackingCode}
            onChange={(e) => {
              setTrackingCode(e.target.value.toUpperCase());
              if (errors.trackingCode) setErrors((prev) => ({ ...prev, trackingCode: '' }));
            }}
            placeholder="MOV-K8X9-4M2P"
            disabled={isSubmitting}
            className={`w-full px-3.5 py-2.5 bg-slate-950/80 border rounded-xl text-sm font-mono text-cyan-300 placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-cyan-500 transition-all ${
              errors.trackingCode ? 'border-rose-500' : 'border-slate-800 focus:border-cyan-500'
            }`}
          />
          {errors.trackingCode && (
            <p className="text-[11px] text-rose-400 mt-1 font-medium">{errors.trackingCode}</p>
          )}
        </div>

        {/* Priority Level */}
        <div>
          <label htmlFor="priority" className="block text-xs font-bold text-slate-300 mb-1.5">
            Priority Level *
          </label>
          <select
            id="priority"
            value={priority}
            onChange={(e) => setPriority(e.target.value as PriorityLevel)}
            disabled={isSubmitting}
            className="w-full px-3.5 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-sm text-slate-200 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all"
          >
            <option value="low">Low Priority</option>
            <option value="normal">Normal Priority</option>
            <option value="high">High Priority</option>
            <option value="urgent">⚡ Urgent Priority</option>
          </select>
        </div>

        {/* Customer Name */}
        <div>
          <label htmlFor="customerName" className="block text-xs font-bold text-slate-300 mb-1.5 flex items-center gap-1.5">
            <User className="w-3.5 h-3.5 text-cyan-400" />
            Customer Name *
          </label>
          <input
            id="customerName"
            type="text"
            value={customerName}
            onChange={(e) => {
              setCustomerName(e.target.value);
              if (errors.customerName) setErrors((prev) => ({ ...prev, customerName: '' }));
            }}
            placeholder="e.g. David Vance"
            disabled={isSubmitting}
            className={`w-full px-3.5 py-2.5 bg-slate-950/80 border rounded-xl text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-cyan-500 transition-all ${
              errors.customerName ? 'border-rose-500' : 'border-slate-800 focus:border-cyan-500'
            }`}
          />
          {errors.customerName && (
            <p className="text-[11px] text-rose-400 mt-1 font-medium">{errors.customerName}</p>
          )}
        </div>

        {/* Customer Phone */}
        <div>
          <label htmlFor="customerPhone" className="block text-xs font-bold text-slate-300 mb-1.5">
            Customer Phone *
          </label>
          <input
            id="customerPhone"
            type="tel"
            value={customerPhone}
            onChange={(e) => {
              setCustomerPhone(e.target.value);
              if (errors.customerPhone) setErrors((prev) => ({ ...prev, customerPhone: '' }));
            }}
            placeholder="+1 (555) 019-2834"
            disabled={isSubmitting}
            className={`w-full px-3.5 py-2.5 bg-slate-950/80 border rounded-xl text-sm font-mono text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-cyan-500 transition-all ${
              errors.customerPhone ? 'border-rose-500' : 'border-slate-800 focus:border-cyan-500'
            }`}
          />
          {errors.customerPhone && (
            <p className="text-[11px] text-rose-400 mt-1 font-medium">{errors.customerPhone}</p>
          )}
        </div>

        {/* Destination Address */}
        <div>
          <label htmlFor="destinationAddress" className="block text-xs font-bold text-slate-300 mb-1.5 flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-cyan-400" />
            Destination Street Address *
          </label>
          <input
            id="destinationAddress"
            type="text"
            value={destinationAddress}
            onChange={(e) => {
              setDestinationAddress(e.target.value);
              if (errors.destinationAddress) setErrors((prev) => ({ ...prev, destinationAddress: '' }));
            }}
            placeholder="e.g. 4820 Broadway Ave, Apt 3"
            disabled={isSubmitting}
            className={`w-full px-3.5 py-2.5 bg-slate-950/80 border rounded-xl text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-cyan-500 transition-all ${
              errors.destinationAddress ? 'border-rose-500' : 'border-slate-800 focus:border-cyan-500'
            }`}
          />
          {errors.destinationAddress && (
            <p className="text-[11px] text-rose-400 mt-1 font-medium">{errors.destinationAddress}</p>
          )}
        </div>

        {/* Destination City */}
        <div>
          <label htmlFor="destinationCity" className="block text-xs font-bold text-slate-300 mb-1.5">
            Destination City *
          </label>
          <input
            id="destinationCity"
            type="text"
            value={destinationCity}
            onChange={(e) => {
              setDestinationCity(e.target.value);
              if (errors.destinationCity) setErrors((prev) => ({ ...prev, destinationCity: '' }));
            }}
            placeholder="e.g. New York"
            disabled={isSubmitting}
            className={`w-full px-3.5 py-2.5 bg-slate-950/80 border rounded-xl text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-cyan-500 transition-all ${
              errors.destinationCity ? 'border-rose-500' : 'border-slate-800 focus:border-cyan-500'
            }`}
          />
          {errors.destinationCity && (
            <p className="text-[11px] text-rose-400 mt-1 font-medium">{errors.destinationCity}</p>
          )}
        </div>

        {/* Assign Driver */}
        <div>
          <label htmlFor="driverId" className="block text-xs font-bold text-slate-300 mb-1.5 flex items-center gap-1.5">
            <Truck className="w-3.5 h-3.5 text-cyan-400" />
            Assigned Driver
          </label>
          <select
            id="driverId"
            value={driverId}
            onChange={(e) => setDriverId(e.target.value)}
            disabled={isSubmitting}
            className="w-full px-3.5 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-sm text-slate-200 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all"
          >
            <option value="">Unassigned (Standby Queue)</option>
            {availableDrivers.map((driver) => (
              <option key={driver.id} value={driver.id}>
                {driver.name} ({driver.status} • {driver.vehiclePlate})
              </option>
            ))}
          </select>
        </div>

        {/* Delivery Status */}
        <div>
          <label htmlFor="status" className="block text-xs font-bold text-slate-300 mb-1.5">
            Delivery Status *
          </label>
          <select
            id="status"
            value={status}
            onChange={(e) => setStatus(e.target.value as DeliveryStatus)}
            disabled={isSubmitting}
            className="w-full px-3.5 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-sm text-slate-200 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all"
          >
            <option value="pending">Pending Dispatch</option>
            <option value="in_transit">In Transit</option>
            <option value="delayed">Delayed</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        {/* Estimated Time of Arrival (ETA) */}
        <div>
          <label htmlFor="eta" className="block text-xs font-bold text-slate-300 mb-1.5 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-cyan-400" />
            Estimated Arrival (ETA) *
          </label>
          <input
            id="eta"
            type="datetime-local"
            value={eta}
            onChange={(e) => {
              setEta(e.target.value);
              if (errors.eta) setErrors((prev) => ({ ...prev, eta: '' }));
            }}
            disabled={isSubmitting}
            className={`w-full px-3.5 py-2.5 bg-slate-950/80 border rounded-xl text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-cyan-500 transition-all ${
              errors.eta ? 'border-rose-500' : 'border-slate-800 focus:border-cyan-500'
            }`}
          />
          {errors.eta && (
            <p className="text-[11px] text-rose-400 mt-1 font-medium">{errors.eta}</p>
          )}
        </div>

        {/* Packages Count & Weight */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="packagesCount" className="block text-xs font-bold text-slate-300 mb-1.5">
              Packages *
            </label>
            <input
              id="packagesCount"
              type="number"
              min={1}
              step={1}
              value={packagesCount}
              onChange={(e) => {
                setPackagesCount(parseInt(e.target.value, 10) || 1);
                if (errors.packagesCount) setErrors((prev) => ({ ...prev, packagesCount: '' }));
              }}
              disabled={isSubmitting}
              className={`w-full px-3.5 py-2.5 bg-slate-950/80 border rounded-xl text-sm text-slate-200 focus:outline-none focus:ring-1 focus:ring-cyan-500 transition-all ${
                errors.packagesCount ? 'border-rose-500' : 'border-slate-800 focus:border-cyan-500'
              }`}
            />
            {errors.packagesCount && (
              <p className="text-[11px] text-rose-400 mt-1 font-medium">{errors.packagesCount}</p>
            )}
          </div>

          <div>
            <label htmlFor="weightKg" className="block text-xs font-bold text-slate-300 mb-1.5">
              Weight (kg) *
            </label>
            <input
              id="weightKg"
              type="number"
              min={0}
              step={0.1}
              value={weightKg}
              onChange={(e) => {
                setWeightKg(parseFloat(e.target.value) || 0);
                if (errors.weightKg) setErrors((prev) => ({ ...prev, weightKg: '' }));
              }}
              disabled={isSubmitting}
              className={`w-full px-3.5 py-2.5 bg-slate-950/80 border rounded-xl text-sm text-slate-200 focus:outline-none focus:ring-1 focus:ring-cyan-500 transition-all ${
                errors.weightKg ? 'border-rose-500' : 'border-slate-800 focus:border-cyan-500'
              }`}
            />
            {errors.weightKg && (
              <p className="text-[11px] text-rose-400 mt-1 font-medium">{errors.weightKg}</p>
            )}
          </div>
        </div>
      </div>

      {/* Notes / Special Instructions */}
      <div>
        <label htmlFor="notes" className="block text-xs font-bold text-slate-300 mb-1.5 flex items-center gap-1.5">
          <FileText className="w-3.5 h-3.5 text-cyan-400" />
          Dispatcher Notes / Delivery Instructions
        </label>
        <textarea
          id="notes"
          rows={3}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="e.g. Ring doorbell twice. Leave with building security if recipient unavailable."
          disabled={isSubmitting}
          className="w-full px-3.5 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all resize-none"
        />
      </div>

      {/* Footer Submit / Cancel Controls */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800/80">
        <button
          type="button"
          onClick={onCancel}
          disabled={isSubmitting}
          className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition-colors disabled:opacity-50"
        >
          Cancel
        </button>

        <button
          type="submit"
          disabled={isSubmitting}
          className="px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition-colors flex items-center gap-2 shadow-lg shadow-cyan-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>{mode === 'create' ? 'Dispatching...' : 'Saving Changes...'}</span>
            </>
          ) : (
            <>
              <Package className="w-4 h-4" />
              <span>{mode === 'create' ? 'Create Delivery Order' : 'Update Delivery Order'}</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
};
