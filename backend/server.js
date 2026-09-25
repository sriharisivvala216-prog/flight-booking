// Local development entry point — imports the shared Express app and starts the HTTP server.
// For Vercel serverless deployment, see /api/index.js instead.
import dotenv from 'dotenv';
dotenv.config();

import app from './app.js';

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 SkyWings Flight Backend running on http://localhost:${PORT}`);
});
