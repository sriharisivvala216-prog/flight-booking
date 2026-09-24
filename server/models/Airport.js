import mongoose from 'mongoose';

const airportSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, unique: true, uppercase: true, index: true },
    name: { type: String, required: true },
    city: { type: String, required: true, index: true },
    country: { type: String, required: true },
    terminal: { type: String, default: 'Terminal 1' }
  },
  { timestamps: true }
);

export default mongoose.models.Airport || mongoose.model('Airport', airportSchema);
