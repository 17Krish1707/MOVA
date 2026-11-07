import express, { Application } from 'express';
import cors from 'cors';
import healthRouter from './routes/health.router';
import deliveryRouter from './routes/delivery.router';
import { notFoundHandler, errorHandler } from './middleware';

const app: Application = express();

// 1. Global Pre-Routing Middleware
app.use(cors());
app.use(express.json());

// 2. Primary API Routes
app.use('/api', healthRouter);
app.use('/api/deliveries', deliveryRouter);

// 3. 404 Catch-All Middleware for Unmatched Routes
app.use(notFoundHandler);

// 4. Centralized Error Handling Middleware (must be registered last!)
app.use(errorHandler);

export default app;
