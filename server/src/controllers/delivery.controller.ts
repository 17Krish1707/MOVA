import { Request, Response } from 'express';
import mongoose from 'mongoose';
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

// @desc    Get delivery by ID
// @route   GET /api/deliveries/:id
// @access  Public
export const getDeliveryById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      res.status(400).json({ message: 'Invalid delivery ID format' });
      return;
    }

    const delivery = await Delivery.findById(id);

    if (!delivery) {
      res.status(404).json({ message: 'Delivery not found' });
      return;
    }

    res.status(200).json(delivery);
  } catch (error: any) {
    console.error('[MOVA Server] Get delivery by ID error:', error);
    res.status(500).json({
      message: 'Failed to retrieve delivery',
      error: error.message || 'Internal Server Error',
    });
  }
};

// @desc    Update delivery by ID (partial update)
// @route   PATCH /api/deliveries/:id
// @access  Public
export const updateDelivery = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      res.status(400).json({ message: 'Invalid delivery ID format' });
      return;
    }

    const updatedDelivery = await Delivery.findByIdAndUpdate(id, req.body, {
      new: true, // returns the updated document
      runValidators: true, // run Mongoose schema validators on the patch payload
    });

    if (!updatedDelivery) {
      res.status(404).json({ message: 'Delivery not found' });
      return;
    }

    res.status(200).json(updatedDelivery);
  } catch (error: any) {
    console.error('[MOVA Server] Update delivery error:', error);

    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((val: any) => val.message);
      res.status(400).json({
        message: 'Validation failed',
        errors: messages,
      });
      return;
    }

    res.status(500).json({
      message: 'Failed to update delivery',
      error: error.message || 'Internal Server Error',
    });
  }
};

// @desc    Delete delivery by ID
// @route   DELETE /api/deliveries/:id
// @access  Public
export const deleteDelivery = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      res.status(400).json({ message: 'Invalid delivery ID format' });
      return;
    }

    const deletedDelivery = await Delivery.findByIdAndDelete(id);

    if (!deletedDelivery) {
      res.status(404).json({ message: 'Delivery not found' });
      return;
    }

    res.status(200).json({ message: 'Delivery deleted successfully', id });
  } catch (error: any) {
    console.error('[MOVA Server] Delete delivery error:', error);
    res.status(500).json({
      message: 'Failed to delete delivery',
      error: error.message || 'Internal Server Error',
    });
  }
};
