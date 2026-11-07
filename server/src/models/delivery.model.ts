import mongoose, { Schema, Document } from 'mongoose';

export interface IDelivery extends Document {
  trackingCode: string;
  customerName: string;
  customerPhone: string;
  destinationAddress: string;
  destinationCity: string;
  driverId?: string | null;
  driverName?: string | null;
  status: 'pending' | 'in_transit' | 'delayed' | 'delivered' | 'cancelled';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  eta: Date;
  packagesCount: number;
  weightKg: number;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const deliverySchema = new Schema<IDelivery>(
  {
    trackingCode: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
    },
    customerName: {
      type: String,
      required: true,
      trim: true,
    },
    customerPhone: {
      type: String,
      required: true,
      trim: true,
    },
    destinationAddress: {
      type: String,
      required: true,
      trim: true,
    },
    destinationCity: {
      type: String,
      required: true,
      trim: true,
    },
    driverId: {
      type: String,
      default: null,
    },
    driverName: {
      type: String,
      default: null,
    },
    status: {
      type: String,
      required: true,
      enum: ['pending', 'in_transit', 'delayed', 'delivered', 'cancelled'],
      default: 'pending',
    },
    priority: {
      type: String,
      enum: ['low', 'normal', 'high', 'urgent'],
      default: 'normal',
    },
    eta: {
      type: Date,
      required: true,
    },
    packagesCount: {
      type: Number,
      required: true,
      min: 1,
    },
    weightKg: {
      type: Number,
      required: true,
      min: 0,
    },
    notes: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
    autoIndex: false, // Controlled index creation after safety validation check
  }
);

deliverySchema.index(
  { trackingCode: 1 },
  {
    unique: true,
    name: 'trackingCode_unique',
  }
);

export const Delivery = mongoose.model<IDelivery>('Delivery', deliverySchema);
