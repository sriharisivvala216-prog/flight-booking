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

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from backend/.env or workspace root .env
dotenv.config({ path: path.resolve(__dirname, '.env') });
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const app = express();

// Initialize Database Connection
connectDB();

// CORS — allow all origins (covers Vercel preview URLs + production)
const corsOptions = {
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept']
};
app.use(cors(corsOptions));
app.use(express.json());

// Request logger for debugging
app.use((req, _res, next) => {
  console.log(`[API] ${req.method} ${req.originalUrl}`);
  next();
});

// Root API info endpoint (for Render service health check & browser landing)
app.get('/', (_req, res) => {
  res.json({
    service: 'SkyWings Flight Booking Backend API',
    status: 'online',
    health: '/api/health',
    timestamp: new Date().toISOString(),
    frontendUrl: process.env.FRONTEND_URL || 'https://flight-booking-na5pkq022-sivvala.vercel.app',
    database: getDBStatus()
  });
});

// API Routes (mounted with and without /api prefix for seamless Vercel & Render compatibility)
app.use(['/api/auth', '/auth'], authRoutes);
app.use(['/api/flights', '/flights'], flightRoutes);
app.use(['/api/bookings', '/bookings'], bookingRoutes);
app.use(['/api/admin', '/admin'], adminRoutes);

// Health check with DB status
const healthCheckHandler = (_req, res) => {
  res.json({
    status: 'online',
    timestamp: new Date().toISOString(),
    service: 'SkyWings Flight Booking Backend API',
    database: getDBStatus(),
    version: '1.0.0'
  });
};
app.get(['/api/health', '/health'], healthCheckHandler);

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
