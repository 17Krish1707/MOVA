import { Request, Response } from 'express';
import { Delivery } from '../models/delivery.model';

// @desc    Get all deliveries
// @route   GET /api/deliveries
// @access  Public
export const getDeliveries = async (_req: Request, res: Response): Promise<void> => {
  try {
    const deliveries = await Delivery.find().sort({ createdAt: -1 });
    res.status(200).json(deliveries);
  } catch (error: any) {
    console.error('[MOVA Server] Get deliveries error:', error);
    res.status(500).json({
      message: 'Failed to retrieve deliveries',
      error: error.message || 'Internal Server Error',
    });
  }
};

// @desc    Create a new delivery
// @route   POST /api/deliveries
// @access  Public
export const createDelivery = async (req: Request, res: Response): Promise<void> => {
  try {
    const newDelivery = new Delivery(req.body);
    const savedDelivery = await newDelivery.save();
    res.status(201).json(savedDelivery);
  } catch (error: any) {
    console.error('[MOVA Server] Create delivery error:', error);
    
    // Check if Mongoose Validation Error
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((val: any) => val.message);
      res.status(400).json({
        message: 'Validation failed',
        errors: messages,
      });
      return;
    }

    res.status(500).json({
      message: 'Failed to create delivery',
      error: error.message || 'Internal Server Error',
    });
  }
};
