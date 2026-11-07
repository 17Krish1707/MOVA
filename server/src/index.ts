import dotenv from 'dotenv';
import app from './app';
import { connectDB } from './config/db';
import { ensureSafeUniqueTrackingCodeIndex } from './config/dbSafety';
import { seedInitialDeliveriesIfEmpty } from './controllers/delivery.controller';

dotenv.config();

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    const isProduction = process.env.NODE_ENV === 'production';
    const isConnected = await connectDB();

    if (isConnected) {
      // 1. Audit database safety & verify/create unique index on trackingCode
      const { indexCreated } = await ensureSafeUniqueTrackingCodeIndex();
      if (!indexCreated) {
        console.error('[MOVA Server] ❌ FATAL: Database safety check failed or unique index could not be created.');
        console.error('[MOVA Server] Server startup aborted to prevent unindexed duplicate writes in MongoDB.');
        process.exit(1);
      }

      // 2. Seed initial deliveries if database collection is empty
      await seedInitialDeliveriesIfEmpty();
    } else {
      if (isProduction) {
        console.error('[MOVA Server] ❌ FATAL: In-memory fallback is strictly disabled in production.');
        console.error('[MOVA Server] Server cannot start without an active, verified MongoDB connection.');
        process.exit(1);
      }
      console.log('[MOVA Server] Running with in-memory persistence for local development. To connect to MongoDB, set MONGODB_URI in server/.env');
    }

    app.listen(PORT, () => {
      console.log(`[MOVA Server] API is running on http://localhost:${PORT}`);
      console.log(
        `[MOVA Server] Health check endpoint: http://localhost:${PORT}/api/health`
      );
    });
  } catch (error) {
    console.error('[MOVA Server] Server startup failed:', error);
    process.exit(1);
  }
};

startServer();
