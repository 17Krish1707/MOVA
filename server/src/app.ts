import express, { Application } from 'express';
import cors from 'cors';
import healthRouter from './routes/health.router';
import deliveryRouter from './routes/delivery.router';

const app: Application = express();

// Core Middleware
app.use(cors());
app.use(express.json());

// API Routes
app.use('/api', healthRouter);
app.use('/api/deliveries', deliveryRouter);

export default app;
