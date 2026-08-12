import express, { Application } from 'express';
import cors from 'cors';
import healthRouter from './routes/health.router';

const app: Application = express();

// Core Middleware
app.use(cors());
app.use(express.json());

// API Routes
app.use('/api', healthRouter);

export default app;
