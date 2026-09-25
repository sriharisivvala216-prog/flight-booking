import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    id: { type: String, unique: true, index: true },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ['passenger', 'admin'], default: 'passenger' },
    phone: { type: String, default: '' },
    passportNumber: { type: String, default: '' },
    nationality: { type: String, default: 'International' },
    loyaltyMiles: { type: Number, default: 1250 },
    tier: { type: String, default: 'Silver' }
  },
  { timestamps: true }
);

export default mongoose.models.User || mongoose.model('User', userSchema);
