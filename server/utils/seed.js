import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Airport from '../models/Airport.js';
import Flight from '../models/Flight.js';
import User from '../models/User.js';
import Booking from '../models/Booking.js';
import { readData } from './db.js';

dotenv.config();

const seed = async () => {
  const mongoURI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/skywings_flightbooking';
  console.log(`Connecting to MongoDB at: ${mongoURI}`);

  try {
    await mongoose.connect(mongoURI);
    console.log('Connected to MongoDB. Resetting and seeding collections...');

    await Promise.all([
      Airport.deleteMany({}),
      Flight.deleteMany({}),
      User.deleteMany({}),
      Booking.deleteMany({})
    ]);

    const airports = readData('airports.json');
    const flights = readData('flights.json');
    const users = readData('users.json');
    const bookings = readData('bookings.json');

    await Airport.insertMany(airports);
    console.log(`✓ Seeded ${airports.length} airports`);

    await Flight.insertMany(flights);
    console.log(`✓ Seeded ${flights.length} flights`);

    await User.insertMany(users);
    console.log(`✓ Seeded ${users.length} users`);

    await Booking.insertMany(bookings);
    console.log(`✓ Seeded ${bookings.length} bookings`);

    console.log('\n🎉 Database successfully seeded with Mongoose!');
    process.exit(0);
  } catch (err) {
    console.error('Seeding error:', err);
    process.exit(1);
  }
};

seed();
