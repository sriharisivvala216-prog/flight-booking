import mongoose from 'mongoose';
import User from '../models/User.js';
import Flight from '../models/Flight.js';
import Airport from '../models/Airport.js';
import Booking from '../models/Booking.js';
import { readData, writeData } from '../utils/db.js';

const isMongoReady = () => mongoose.connection && mongoose.connection.readyState === 1;

export const dbService = {
  // --- USERS ---
  async findUserByEmail(email) {
    if (isMongoReady()) {
      return await User.findOne({ email: email.toLowerCase() });
    }
    const users = readData('users.json');
    return users.find((u) => u.email.toLowerCase() === email.toLowerCase()) || null;
  },

  async findUserByIdOrEmail(id, email) {
    if (isMongoReady()) {
      return await User.findOne({
        $or: [{ id }, { email: email ? email.toLowerCase() : '' }]
      });
    }
    const users = readData('users.json');
    return (
      users.find((u) => u.id === id || (email && u.email.toLowerCase() === email.toLowerCase())) ||
      null
    );
  },

  async createUser(userData) {
    if (isMongoReady()) {
      const user = new User(userData);
      return await user.save();
    }
    const users = readData('users.json');
    users.push(userData);
    writeData('users.json', users);
    return userData;
  },

  async getAllUsers() {
    if (isMongoReady()) {
      return await User.find().lean();
    }
    return readData('users.json');
  },

  // --- AIRPORTS ---
  async getAirports() {
    if (isMongoReady()) {
      const airports = await Airport.find().lean();
      if (airports.length > 0) return airports;
    }
    return readData('airports.json');
  },

  // --- FLIGHTS ---
  async getFlights() {
    if (isMongoReady()) {
      const flights = await Flight.find().lean();
      if (flights.length > 0) return flights;
    }
    return readData('flights.json');
  },

  async getFlightById(id) {
    if (isMongoReady()) {
      const flight = await Flight.findOne({ id }).lean();
      if (flight) return flight;
    }
    const flights = readData('flights.json');
    return flights.find((f) => f.id === id) || null;
  },

  async createFlight(flightData) {
    if (isMongoReady()) {
      const flight = new Flight(flightData);
      await flight.save();
    }
    const flights = readData('flights.json');
    flights.unshift(flightData);
    writeData('flights.json', flights);
    return flightData;
  },

  async updateFlight(id, updates) {
    if (isMongoReady()) {
      await Flight.findOneAndUpdate({ id }, updates, { new: true });
    }
    const flights = readData('flights.json');
    const idx = flights.findIndex((f) => f.id === id);
    if (idx !== -1) {
      flights[idx] = { ...flights[idx], ...updates };
      writeData('flights.json', flights);
      return flights[idx];
    }
    return null;
  },

  async deleteFlight(id) {
    if (isMongoReady()) {
      await Flight.findOneAndDelete({ id });
    }
    let flights = readData('flights.json');
    const initialLen = flights.length;
    flights = flights.filter((f) => f.id !== id);
    if (flights.length !== initialLen) {
      writeData('flights.json', flights);
      return true;
    }
    return false;
  },

  // --- BOOKINGS ---
  async getBookings(userId, email) {
    if (isMongoReady()) {
      const query = {};
      if (userId) query.userId = userId;
      if (email) query['contact.email'] = email;
      const bookings = await Booking.find(query).sort({ createdAt: -1 }).lean();
      if (bookings.length > 0) return bookings;
    }
    const bookings = readData('bookings.json');
    if (userId || email) {
      return bookings.filter(
        (b) =>
          (userId && b.userId === userId) ||
          (email && b.contact?.email?.toLowerCase() === email.toLowerCase())
      );
    }
    return bookings;
  },

  async getBookingByPNR(pnr) {
    if (isMongoReady()) {
      const booking = await Booking.findOne({ pnr: pnr.toUpperCase() }).lean();
      if (booking) return booking;
    }
    const bookings = readData('bookings.json');
    return bookings.find((b) => b.pnr.toUpperCase() === pnr.toUpperCase()) || null;
  },

  async createBooking(bookingData) {
    if (isMongoReady()) {
      const booking = new Booking(bookingData);
      await booking.save();
    }
    const bookings = readData('bookings.json');
    bookings.unshift(bookingData);
    writeData('bookings.json', bookings);
    return bookingData;
  },

  async updateBooking(pnr, updates) {
    if (isMongoReady()) {
      await Booking.findOneAndUpdate({ pnr: pnr.toUpperCase() }, updates, { new: true });
    }
    const bookings = readData('bookings.json');
    const idx = bookings.findIndex((b) => b.pnr.toUpperCase() === pnr.toUpperCase());
    if (idx !== -1) {
      bookings[idx] = { ...bookings[idx], ...updates };
      writeData('bookings.json', bookings);
      return bookings[idx];
    }
    return null;
  }
};

export default dbService;
