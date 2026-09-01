import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import path from 'path';
import { fileURLToPath } from 'url';

import apiRoutes from './routes/index.js';
import { errorHandler } from './middlewares/errorMiddleware.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Static uploads folder for serving uploaded videos & thumbnails
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'Video App Backend API is up and running!',
    timestamp: new Date().toISOString()
  });
});

// API Routes (v1)
app.use('/api/v1', apiRoutes);

// Global Error Handler
app.use(errorHandler);

export default app;
