// Local development entry point — imports the shared Express app and starts the HTTP server.
// For Vercel serverless deployment, see /api/index.js instead.
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '.env') });
dotenv.config({ path: path.resolve(__dirname, '../.env') });

import app from './app.js';

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 SkyWings Flight Backend running on http://localhost:${PORT}`);
});
