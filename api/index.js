// Vercel Serverless Function entry point.
// Imports the shared Express app and exports it as the default handler.
// Vercel's @vercel/node runtime wraps this automatically.
import app from '../backend/app.js';

export default app;
