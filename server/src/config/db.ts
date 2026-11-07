import mongoose from 'mongoose';

/**
 * Sanitizes connection strings to prevent credential exposure in logs.
 */
export const sanitizeDbError = (err: unknown): string => {
  const msg = err instanceof Error ? err.message : String(err);
  return msg.replace(/(mongodb(?:\+srv)?:\/\/)([^:@\s]+):([^@\s]+)@/gi, '$1***:***@');
};

export const connectDB = async (): Promise<boolean> => {
  const mongodbUri = process.env.MONGODB_URI;
  const isProduction = process.env.NODE_ENV === 'production';

  if (!mongodbUri) {
    if (isProduction) {
      console.error('[MOVA Server] ❌ FATAL: MONGODB_URI is required in production environment.');
      process.exit(1);
    }
    console.warn('[MOVA Server] Notice: MONGODB_URI is not set. Operating in in-memory mode for local development.');
    return false;
  }

  try {
    await mongoose.connect(mongodbUri, { serverSelectionTimeoutMS: 3000 });
    console.log('[MOVA Server] MongoDB connected successfully');
    return true;
  } catch (error) {
    const safeError = sanitizeDbError(error);
    if (isProduction) {
      console.error('[MOVA Server] ❌ FATAL: Production MongoDB connection failed:', safeError);
      console.error('[MOVA Server] In-memory fallback is strictly disabled in production. Aborting startup.');
      process.exit(1);
    }

    console.warn('[MOVA Server] Warning: Could not connect to MongoDB:', safeError);
    console.warn('[MOVA Server] Falling back to in-memory mode for local development.');
    return false;
  }
};


