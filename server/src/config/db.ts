import mongoose from 'mongoose';

export const connectDB = async (): Promise<void> => {
  const mongodbUri = process.env.MONGODB_URI;

  if (!mongodbUri) {
    console.error('[MOVA Server] Error: MONGODB_URI environment variable is missing.');
    throw new Error('MONGODB_URI environment variable is not defined');
  }

  try {
    await mongoose.connect(mongodbUri);
    console.log('[MOVA Server] MongoDB connected successfully');
  } catch (error) {
    console.error('[MOVA Server] MongoDB connection error:', error);
    throw error;
  }
};
