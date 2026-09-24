import mongoose from 'mongoose';

const passengerSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, default: '' },
    gender: { type: String, default: 'Unspecified' },
    age: { type: Number, default: 30 },
    passport: { type: String, default: '' },
    seat: { type: String, default: '' },
    meal: { type: String, default: 'Standard Meal' }
  },
  { _id: false }
);

const bookingSchema = new mongoose.Schema(
  {
    id: { type: String, unique: true, index: true },
    pnr: { type: String, required: true, unique: true, uppercase: true, index: true },
    userId: { type: String, default: 'GUEST', index: true },
    flightId: { type: String, required: true },
    flightNumber: { type: String, required: true },
    airline: { type: String, required: true },
    airlineLogo: { type: String, default: '' },
    from: { type: String, required: true },
    fromCity: { type: String, required: true },
    to: { type: String, required: true },
    toCity: { type: String, required: true },
    departureDate: { type: String, required: true },
    departureTime: { type: String, required: true },
    arrivalTime: { type: String, required: true },
    duration: { type: String, default: '' },
    aircraft: { type: String, default: '' },
    cabinClass: { type: String, default: 'economy' },
    passengers: [passengerSchema],
    contact: {
      email: { type: String, default: '' },
      phone: { type: String, default: '' }
    },
    addons: {
      travelInsurance: { type: Boolean, default: false },
      priorityBoarding: { type: Boolean, default: false },
      extraBaggage: { type: Number, default: 0 },
      loungeAccess: { type: Boolean, default: false }
    },
    totalAmount: { type: Number, required: true },
    currency: { type: String, default: 'USD' },
    paymentMethod: { type: String, default: 'Credit Card' },
    status: {
      type: String,
      enum: ['CONFIRMED', 'CANCELLED', 'CHECKED_IN', 'REFUNDED'],
      default: 'CONFIRMED'
    },
    terminal: { type: String, default: '1' },
    gate: { type: String, default: 'A1' },
    webCheckin: {
      checkedIn: { type: Boolean, default: false },
      checkinTime: { type: Date },
      digitalBoardingPassUrl: { type: String }
    }
  },
  { timestamps: true }
);

export default mongoose.models.Booking || mongoose.model('Booking', bookingSchema);
