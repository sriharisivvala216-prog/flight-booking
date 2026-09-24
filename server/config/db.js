import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Airport from '../models/Airport.js';
import Flight from '../models/Flight.js';
import User from '../models/User.js';
import Booking from '../models/Booking.js';
import { readData } from '../utils/db.js';

dotenv.config();

let isConnected = false;

export const connectDB = async () => {
  if (isConnected) return;

  const mongoURI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/skywings_flightbooking';

  try {
    const conn = await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 3000
    });

    isConnected = true;
    console.log(`🍃 MongoDB Connected: ${conn.connection.host}/${conn.connection.name}`);

    // Seed database if collections are empty
    await seedInitialData();
  } catch (error) {
    console.warn(`⚠️  MongoDB connection notice: ${error.message}`);
    console.log('ℹ️  Running in resilient dual-mode: JSON file store active for seamless operation.');
    console.log('👉 To connect to cloud MongoDB Atlas, set MONGODB_URI in your .env file.');
  }
};

export const getDBStatus = () => ({
  connected: isConnected,
  database: isConnected ? mongoose.connection.name : 'local-json-store',
  engine: isConnected ? 'MongoDB (Mongoose)' : 'JSON File Store (Fallback)'
});

const seedInitialData = async () => {
  try {
    const airportCount = await Airport.countDocuments();
    if (airportCount === 0) {
      const airports = readData('airports.json');
      if (airports.length > 0) {
        await Airport.insertMany(airports);
        console.log(`✅ Seeded ${airports.length} airports into MongoDB`);
      }
    }

    const flightCount = await Flight.countDocuments();
    if (flightCount === 0) {
      const flights = readData('flights.json');
      if (flights.length > 0) {
        await Flight.insertMany(flights);
        console.log(`✅ Seeded ${flights.length} flights into MongoDB`);
      }
    }

    const userCount = await User.countDocuments();
    if (userCount === 0) {
      const users = readData('users.json');
      if (users.length > 0) {
        await User.insertMany(users);
        console.log(`✅ Seeded ${users.length} users into MongoDB`);
      }
    }

    const bookingCount = await Booking.countDocuments();
    if (bookingCount === 0) {
      const bookings = readData('bookings.json');
      if (bookings.length > 0) {
        await Booking.insertMany(bookings);
        console.log(`✅ Seeded ${bookings.length} bookings into MongoDB`);
      }
    }
  } catch (seedErr) {
    console.warn('DB auto-seed notice:', seedErr.message);
  }
};

export default connectDB;
