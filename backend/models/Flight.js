import mongoose from 'mongoose';

const flightSchema = new mongoose.Schema(
  {
    id: { type: String, unique: true, index: true },
    flightNumber: { type: String, required: true, uppercase: true, index: true },
    airline: { type: String, required: true },
    airlineLogo: { type: String, default: '' },
    from: { type: String, required: true, uppercase: true, index: true },
    fromCity: { type: String, required: true },
    to: { type: String, required: true, uppercase: true, index: true },
    toCity: { type: String, required: true },
    departureTime: { type: String, required: true },
    arrivalTime: { type: String, required: true },
    duration: { type: String, required: true },
    stops: { type: Number, default: 0 },
    stopDetails: { type: String, default: 'Non-stop' },
    aircraft: { type: String, default: 'Boeing 787-9' },
    basePrice: { type: Number, required: true },
    pricing: {
      economy: { type: Number, required: true },
      premium_economy: { type: Number, default: 0 },
      business: { type: Number, default: 0 },
      first: { type: Number, default: 0 }
    },
    availableSeats: { type: Number, default: 50 },
    baggage: { type: String, default: '1 checked bag (23kg) + 7kg cabin' },
    mealsIncluded: { type: Boolean, default: true },
    wifiAvailable: { type: Boolean, default: true },
    status: {
      type: String,
      enum: ['On Time', 'Boarding', 'Delayed', 'Departed', 'Landed', 'Cancelled'],
      default: 'On Time'
    },
    gate: { type: String, default: 'A12' },
    terminal: { type: String, default: '1' }
  },
  { timestamps: true }
);

export default mongoose.models.Flight || mongoose.model('Flight', flightSchema);
