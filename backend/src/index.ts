import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { useCaseRouter } from './routes/useCase';
import { profileRouter } from './routes/profile';
import { simplifierRouter } from './routes/simplifier';
import { errorHandler } from './middleware/errorHandler';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Routes
app.use('/api/use-case', useCaseRouter);
app.use('/api/profile', profileRouter);
app.use('/api/simplifier', simplifierRouter);

// Error handling
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`🚀 FHIRSquire backend running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
});
