import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { Delivery } from '../models/delivery.model';
import { AppError, catchAsync } from '../utils';

/**
 * @desc    Get all deliveries
 * @route   GET /api/deliveries
 * @access  Public
 */
export const getDeliveries = catchAsync(
  async (_req: Request, res: Response, _next: NextFunction): Promise<void> => {
    const deliveries = await Delivery.find().sort({ createdAt: -1 });
    res.status(200).json(deliveries);
  }
);

/**
 * @desc    Create a new delivery
 * @route   POST /api/deliveries
 * @access  Public
 */
export const createDelivery = catchAsync(
  async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
    const newDelivery = new Delivery(req.body);
    const savedDelivery = await newDelivery.save();
    res.status(201).json(savedDelivery);
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

    const delivery = await Delivery.findById(id);

    if (!delivery) {
      return next(new AppError(404, `Delivery with ID '${id}' not found`));
    }

    res.status(200).json(delivery);
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

    const updatedDelivery = await Delivery.findByIdAndUpdate(id, req.body, {
      new: true, // returns updated document
      runValidators: true, // triggers schema validations on patched fields
    });

    if (!updatedDelivery) {
      return next(new AppError(404, `Delivery with ID '${id}' not found`));
    }

    res.status(200).json(updatedDelivery);
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

    const deletedDelivery = await Delivery.findByIdAndDelete(id);

    if (!deletedDelivery) {
      return next(new AppError(404, `Delivery with ID '${id}' not found`));
    }

    res.status(200).json({
      status: 'success',
      message: 'Delivery deleted successfully',
      id,
    });
  }
);
