import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import path from 'path';

import uploadRoutes from './routes/upload';
import trainingRoutes from './routes/training';
import generationRoutes from './routes/generation';
import animationRoutes from './routes/animation';
import upscalingRoutes from './routes/upscaling';
import videoRoutes from './routes/video';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Static files
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Routes
app.use('/api/upload', uploadRoutes);
app.use('/api/training', trainingRoutes);
app.use('/api/generation', generationRoutes);
app.use('/api/animation', animationRoutes);
app.use('/api/upscaling', upscalingRoutes);
app.use('/api/video', videoRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Creator AI Backend server running on port ${PORT}`);
  console.log(`📁 Upload directory: ${path.join(__dirname, '../uploads')}`);
});

export default app;