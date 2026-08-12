import dotenv from 'dotenv';
import app from './app';
import { connectDB } from './config/db';

dotenv.config();

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();

    app.listen(PORT, () => {
      console.log(`[MOVA Server] API is running on http://localhost:${PORT}`);
      console.log(
        `[MOVA Server] Health check endpoint: http://localhost:${PORT}/api/health`
      );
    });
  } catch (error) {
    console.error('[MOVA Server] Server startup failed due to database connection issue:', error);
    process.exit(1);
  }
};

startServer();