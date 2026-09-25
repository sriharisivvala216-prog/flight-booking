// Vercel Serverless Function entry point.
// Connects to DB and routes through the shared Express app.
import app from '../backend/app.js';
import { connectDB } from '../backend/config/db.js';

export default async function handler(req, res) {
  // Ensure MongoDB connection is ready in serverless lifecycle
  try {
    await connectDB();
  } catch (err) {
    console.error('Serverless DB connection error:', err.message);
  }
  return app(req, res);
}
