import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { Delivery } from '../models/delivery.model';
import { AppError, catchAsync } from '../utils';

export interface InMemoryDelivery {
  _id: string;
  trackingCode: string;
  customerName: string;
  customerPhone: string;
  destinationAddress: string;
  destinationCity: string;
  driverId: string | null;
  driverName: string | null;
  status: 'pending' | 'in_transit' | 'delayed' | 'delivered' | 'cancelled';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  eta: string;
  packagesCount: number;
  weightKg: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

const DEFAULT_DELIVERIES: InMemoryDelivery[] = [
  {
    _id: '64f1a2b3c4d5e6f7a8b9c001',
    trackingCode: 'MOVA-8901-X',
    customerName: 'Sarah Lin',
    customerPhone: '+1 (555) 234-5678',
    destinationAddress: '742 Evergreen Terrace, Suite 4B',
    destinationCity: 'Metro Central',
    driverId: 'DRV-101',
    driverName: 'Marcus Vance',
    status: 'in_transit',
    priority: 'urgent',
    eta: '14:25 (in 12 min)',
    packagesCount: 3,
    weightKg: 4.8,
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    updatedAt: new Date(Date.now() - 3600000).toISOString(),
    notes: 'Fragile electronics. Deliver to concierge desk if unavailable.',
  },
  {
    _id: '64f1a2b3c4d5e6f7a8b9c002',
    trackingCode: 'MOVA-8902-Y',
    customerName: 'TechCorp Logistics',
    customerPhone: '+1 (555) 987-6543',
    destinationAddress: '1200 Innovation Way, Building C',
    destinationCity: 'Tech District',
    driverId: 'DRV-102',
    driverName: 'Elena Rostova',
    status: 'delayed',
    priority: 'high',
    eta: '14:50 (Delayed by 18 min)',
    packagesCount: 12,
    weightKg: 34.5,
    createdAt: new Date(Date.now() - 7200000).toISOString(),
    updatedAt: new Date(Date.now() - 7200000).toISOString(),
    notes: 'Heavy traffic build-up on North Express Connector.',
  },
  {
    _id: '64f1a2b3c4d5e6f7a8b9c003',
    trackingCode: 'MOVA-8903-Z',
    customerName: 'David Miller',
    customerPhone: '+1 (555) 456-7890',
    destinationAddress: '88 West End Ave, Apt 12F',
    destinationCity: 'Downtown Core',
    driverId: null,
    driverName: null,
    status: 'pending',
    priority: 'normal',
    eta: 'Unassigned',
    packagesCount: 1,
    weightKg: 1.2,
    createdAt: new Date(Date.now() - 1800000).toISOString(),
    updatedAt: new Date(Date.now() - 1800000).toISOString(),
    notes: 'Standard delivery package ready at Hub 4.',
  },
  {
    _id: '64f1a2b3c4d5e6f7a8b9c004',
    trackingCode: 'MOVA-8904-A',
    customerName: 'Apex Medical Supplies',
    customerPhone: '+1 (555) 321-7654',
    destinationAddress: '450 University Blvd, Room 204',
    destinationCity: 'Medical Center',
    driverId: 'DRV-104',
    driverName: 'Carlos Mendez',
    status: 'in_transit',
    priority: 'urgent',
    eta: '14:35 (in 22 min)',
    packagesCount: 5,
    weightKg: 12.0,
    createdAt: new Date(Date.now() - 5400000).toISOString(),
    updatedAt: new Date(Date.now() - 5400000).toISOString(),
    notes: 'Temperature sensitive pharmaceuticals.',
  },
  {
    _id: '64f1a2b3c4d5e6f7a8b9c005',
    trackingCode: 'MOVA-8905-B',
    customerName: 'Jessica Taylor',
    customerPhone: '+1 (555) 654-3210',
    destinationAddress: '159 Oakridge Drive',
    destinationCity: 'West Suburbs',
    driverId: 'DRV-103',
    driverName: 'Aisha Patel',
    status: 'delivered',
    priority: 'normal',
    eta: 'Delivered at 13:58',
    packagesCount: 2,
    weightKg: 3.1,
    createdAt: new Date(Date.now() - 10800000).toISOString(),
    updatedAt: new Date(Date.now() - 600000).toISOString(),
    notes: 'Left at front porch per customer request.',
  },
];

let inMemoryDeliveries: InMemoryDelivery[] = [...DEFAULT_DELIVERIES];

const isDbConnected = (): boolean => mongoose.connection.readyState === 1;

const escapeRegex = (str: string): string =>
  str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/**
 * Seeds initial mock deliveries into MongoDB if the collection is empty.
 */
export const seedInitialDeliveriesIfEmpty = async (): Promise<void> => {
  try {
    const count = await Delivery.countDocuments();
    if (count === 0) {
      console.log('[MOVA Server] Seeding initial deliveries into MongoDB...');
      await Delivery.insertMany(
        DEFAULT_DELIVERIES.map(({ _id, ...rest }) => ({
          ...rest,
          trackingCode: rest.trackingCode.trim().toUpperCase(),
          eta: new Date(),
        }))
      );
      console.log('[MOVA Server] Initial delivery manifests seeded successfully.');
    }
  } catch (err) {
    console.warn('[MOVA Server] Error seeding initial deliveries:', err);
  }
};

/**
 * @desc    Get all deliveries
 * @route   GET /api/deliveries
 * @access  Public
 */
export const getDeliveries = catchAsync(
  async (_req: Request, res: Response, _next: NextFunction): Promise<void> => {
    if (isDbConnected()) {
      const deliveries = await Delivery.find().sort({ createdAt: -1 });
      res.status(200).json(deliveries);
      return;
    }

    const sorted = [...inMemoryDeliveries].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    res.status(200).json(sorted);
  }
);

/**
 * @desc    Create a new delivery
 * @route   POST /api/deliveries
 * @access  Public
 */
export const createDelivery = catchAsync(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const rawCode = (req.body.trackingCode || '').toString();
    const normalizedCode = rawCode.trim().toUpperCase();

    if (isDbConnected()) {
      // 1. Check for duplicate tracking code using exact normalized match on standard unique index
      const existing = await Delivery.findOne({
        trackingCode: normalizedCode,
      });

      if (existing) {
        return next(
          new AppError(
            409,
            `Tracking code '${normalizedCode}' already exists. Please use a unique tracking code.`
          )
        );
      }

      const newDelivery = new Delivery({
        ...req.body,
        trackingCode: normalizedCode,
      });
      const savedDelivery = await newDelivery.save();
      res.status(201).json(savedDelivery);
      return;
    }

    // In-memory store duplicate check
    const existingInMemory = inMemoryDeliveries.find(
      (d) => d.trackingCode === normalizedCode
    );

    if (existingInMemory) {
      return next(
        new AppError(
          409,
          `Tracking code '${normalizedCode}' already exists. Please use a unique tracking code.`
        )
      );
    }

    const now = new Date().toISOString();
    const createdItem: InMemoryDelivery = {
      _id: new mongoose.Types.ObjectId().toHexString(),
      trackingCode: normalizedCode,
      customerName: req.body.customerName,
      customerPhone: req.body.customerPhone,
      destinationAddress: req.body.destinationAddress,
      destinationCity: req.body.destinationCity,
      driverId: req.body.driverId ?? null,
      driverName: req.body.driverName ?? null,
      status: req.body.status ?? 'pending',
      priority: req.body.priority ?? 'normal',
      eta: req.body.eta,
      packagesCount: Number(req.body.packagesCount),
      weightKg: Number(req.body.weightKg),
      notes: req.body.notes,
      createdAt: now,
      updatedAt: now,
    };

    inMemoryDeliveries.unshift(createdItem);
    res.status(201).json(createdItem);
  }
);

/**
 * @desc    Get delivery by ID
 * @route   GET /api/deliveries/:id
 * @access  Public
 */
export const getDeliveryById = catchAsync(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return next(new AppError(400, `Invalid delivery ID format: '${id}'`));
    }

    if (isDbConnected()) {
      const delivery = await Delivery.findById(id);
      if (!delivery) {
        return next(new AppError(404, `Delivery with ID '${id}' not found`));
      }
      res.status(200).json(delivery);
      return;
    }

    const item = inMemoryDeliveries.find((d) => d._id === id);
    if (!item) {
      return next(new AppError(404, `Delivery with ID '${id}' not found`));
    }

    res.status(200).json(item);
  }
);

/**
 * @desc    Update delivery by ID (partial update)
 * @route   PATCH /api/deliveries/:id
 * @access  Public
 */
export const updateDelivery = catchAsync(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return next(new AppError(400, `Invalid delivery ID format: '${id}'`));
    }

    // If updating trackingCode, check for duplicates excluding this document
    if (req.body.trackingCode !== undefined) {
      const normalizedCode = req.body.trackingCode.toString().trim().toUpperCase();

      if (isDbConnected()) {
        const existing = await Delivery.findOne({
          _id: { $ne: id },
          trackingCode: normalizedCode,
        });

        if (existing) {
          return next(
            new AppError(
              409,
              `Tracking code '${normalizedCode}' already exists on another delivery order. Please use a unique tracking code.`
            )
          );
        }

        req.body.trackingCode = normalizedCode;
      } else {
        const existingInMemory = inMemoryDeliveries.find(
          (d) => d._id !== id && d.trackingCode === normalizedCode
        );

        if (existingInMemory) {
          return next(
            new AppError(
              409,
              `Tracking code '${normalizedCode}' already exists on another delivery order. Please use a unique tracking code.`
            )
          );
        }

        req.body.trackingCode = normalizedCode;
      }
    }

    if (isDbConnected()) {
      const updatedDelivery = await Delivery.findByIdAndUpdate(id, req.body, {
        returnDocument: 'after', // returns updated document
        runValidators: true, // triggers schema validations on patched fields
      });

      if (!updatedDelivery) {
        return next(new AppError(404, `Delivery with ID '${id}' not found`));
      }

      res.status(200).json(updatedDelivery);
      return;
    }

    const index = inMemoryDeliveries.findIndex((d) => d._id === id);
    if (index === -1) {
      return next(new AppError(404, `Delivery with ID '${id}' not found`));
    }

    const current = inMemoryDeliveries[index];
    const updated: InMemoryDelivery = {
      ...current,
      ...req.body,
      _id: current._id, // preserve immutable id
      updatedAt: new Date().toISOString(),
    };

    inMemoryDeliveries[index] = updated;
    res.status(200).json(updated);
  }
);

/**
 * @desc    Delete delivery by ID
 * @route   DELETE /api/deliveries/:id
 * @access  Public
 */
export const deleteDelivery = catchAsync(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return next(new AppError(400, `Invalid delivery ID format: '${id}'`));
    }

    if (isDbConnected()) {
      const deletedDelivery = await Delivery.findByIdAndDelete(id);
      if (!deletedDelivery) {
        return next(new AppError(404, `Delivery with ID '${id}' not found`));
      }

      res.status(200).json({
        status: 'success',
        message: 'Delivery deleted successfully',
        id,
      });
      return;
    }

    const index = inMemoryDeliveries.findIndex((d) => d._id === id);
    if (index === -1) {
      return next(new AppError(404, `Delivery with ID '${id}' not found`));
    }

    inMemoryDeliveries.splice(index, 1);
    res.status(200).json({
      status: 'success',
      message: 'Delivery deleted successfully',
      id,
    });
  }
);

