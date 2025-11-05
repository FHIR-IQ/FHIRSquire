// Vercel Serverless Function Entry Point
// This exports the Express app for Vercel's serverless platform

import express from 'express';
import cors from 'cors';
import { useCaseRouter } from './routes/useCase';
import { profileRouter } from './routes/profile';
import { simplifierRouter } from './routes/simplifier';
import { errorHandler } from './middleware/errorHandler';

const app = express();

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Routes (no /api prefix - Vercel rewrite handles that)
app.use('/use-case', useCaseRouter);
app.use('/profile', profileRouter);
app.use('/simplifier', simplifierRouter);

// Error handling
app.use(errorHandler);

// Export for Vercel
export default app;
