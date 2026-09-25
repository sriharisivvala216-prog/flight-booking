import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import authRoutes from './routes/auth.js';
import flightRoutes from './routes/flights.js';
import bookingRoutes from './routes/bookings.js';
import adminRoutes from './routes/admin.js';
import { connectDB, getDBStatus } from './config/db.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Initialize Database Connection
connectDB();

// CORS — allow all origins (covers Vercel preview URLs + production)
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept']
}));
app.use(express.json());

// Request logger for debugging
app.use((req, _res, next) => {
  console.log(`[API] ${req.method} ${req.originalUrl}`);
  next();
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/flights', flightRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/admin', adminRoutes);

// Health check with DB status
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'online',
    timestamp: new Date().toISOString(),
    service: 'SkyWings Flight Booking Backend API',
    database: getDBStatus(),
    version: '1.0.0'
  });
});

// Production: Serve frontend static build files when dist directory exists (local production mode)
const frontendDistPath = path.resolve(__dirname, '../frontend/dist');
const rootDistPath = path.resolve(__dirname, '../dist');
const distPath = fs.existsSync(frontendDistPath) ? frontendDistPath : (fs.existsSync(rootDistPath) ? rootDistPath : null);

if (distPath) {
  app.use(express.static(distPath));
  app.use((req, res, next) => {
    if (req.method === 'GET' && !req.path.startsWith('/api')) {
      return res.sendFile(path.join(distPath, 'index.html'));
    }
    next();
  });
}

export default app;
