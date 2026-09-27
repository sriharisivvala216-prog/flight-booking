import express from 'express';
import mongoose from 'mongoose';
import Flight from '../models/Flight.js';
import Booking from '../models/Booking.js';
import { readData, writeData } from '../utils/db.js';

const router = express.Router();

// Helper: check if MongoDB is connected
const isMongoConnected = () => mongoose.connection.readyState === 1;

// Helper to generate a unique PNR code
const generatePNR = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let pnr = 'SKW';
  for (let i = 0; i < 3; i++) {
    pnr += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return pnr;
};

// ─── POST /api/bookings — Create a new booking ───
router.post('/', async (req, res) => {
  try {
    const {
      userId,
      flightId,
      cabinClass = 'economy',
      departureDate,
      passengers,
      contact,
      addons = {},
      totalAmount,
      currency = 'USD',
      paymentMethod = 'Credit Card',
      flightMeta = null
    } = req.body;

    if (!flightId || !passengers || passengers.length === 0) {
      return res.status(400).json({ message: 'Flight ID and passenger details are required' });
    }

    // STEP 1: Find the flight — MongoDB first, then JSON fallback, then flightMeta
    let flight = null;

    if (isMongoConnected()) {
      flight = await Flight.findOne({ id: flightId }).lean();
    }

    if (!flight) {
      const jsonFlights = readData('flights.json');
      flight = jsonFlights.find(f => f.id === flightId) || null;
    }

    if (!flight) {
      // Final fallback: use flightMeta supplied by the frontend (for demo flights)
      if (flightMeta && flightMeta.flightNumber) {
        flight = { id: flightId, ...flightMeta };
      } else {
        return res.status(404).json({
          message: 'Flight not found. Please search and select a flight before booking.'
        });
      }
    }

    // STEP 2: Generate unique PNR
    let pnr = generatePNR();
    if (isMongoConnected()) {
      while (await Booking.exists({ pnr })) pnr = generatePNR();
    } else {
      const existing = readData('bookings.json');
      while (existing.some(b => b.pnr === pnr)) pnr = generatePNR();
    }

    // STEP 3: Build booking object
    const bookingId = `BKG-${Date.now().toString(36).toUpperCase()}`;
    const newBookingData = {
      id: bookingId,
      pnr,
      userId: userId || 'GUEST',
      flightId: flight.id,
      flightNumber: flight.flightNumber,
      airline: flight.airline,
      airlineLogo: flight.airlineLogo || '',
      from: flight.from,
      fromCity: flight.fromCity,
      to: flight.to,
      toCity: flight.toCity,
      departureDate: departureDate || new Date().toISOString().split('T')[0],
      departureTime: flight.departureTime,
      arrivalTime: flight.arrivalTime,
      duration: flight.duration || '',
      aircraft: flight.aircraft || '',
      cabinClass,
      passengers: passengers.map((p, idx) => ({
        firstName: p.firstName || `Passenger ${idx + 1}`,
        lastName: p.lastName || '',
        gender: p.gender || 'Not specified',
        age: p.age || 30,
        passport: p.passport || 'AUTO-' + Math.floor(100000 + Math.random() * 900000),
        seat: p.seat || `${12 + idx}B`,
        meal: p.meal || 'Standard Meal'
      })),
      contact: contact || { email: 'guest@skywings.com', phone: '+1 555-0100' },
      addons: {
        travelInsurance: !!addons.travelInsurance,
        priorityBoarding: !!addons.priorityBoarding,
        extraBaggage: addons.extraBaggage || 0
      },
      totalAmount: totalAmount || (flight.pricing?.[cabinClass] || flight.basePrice || 500) * passengers.length,
      currency,
      paymentMethod,
      status: 'CONFIRMED',
      terminal: flight.terminal || '3',
      gate: flight.gate || 'B12',
      boardingTime: '45 mins before departure',
      createdAt: new Date().toISOString()
    };

    // STEP 4: Save booking
    if (isMongoConnected()) {
      const saved = await Booking.create(newBookingData);

      // Decrement seat count in MongoDB
      await Flight.updateOne(
        { id: flightId, availableSeats: { $gte: passengers.length } },
        { $inc: { availableSeats: -passengers.length } }
      );

      return res.status(201).json({
        message: 'Booking confirmed successfully!',
        booking: saved.toObject()
      });
    } else {
      const bookings = readData('bookings.json');
      bookings.unshift(newBookingData);
      writeData('bookings.json', bookings);

      const jsonFlights = readData('flights.json');
      const fIdx = jsonFlights.findIndex(f => f.id === flightId);
      if (fIdx !== -1 && jsonFlights[fIdx].availableSeats >= passengers.length) {
        jsonFlights[fIdx].availableSeats -= passengers.length;
        writeData('flights.json', jsonFlights);
      }

      return res.status(201).json({
        message: 'Booking confirmed successfully!',
        booking: newBookingData
      });
    }
  } catch (error) {
    console.error('Create booking error:', error);
    res.status(500).json({ message: 'Internal server error while processing booking' });
  }
});

// ─── GET /api/bookings — Get user bookings ───
router.get('/', async (req, res) => {
  try {
    const { userId, email } = req.query;

    if (isMongoConnected()) {
      const query = {};
      if (userId) query.userId = userId;
      else if (email) query['contact.email'] = { $regex: new RegExp(`^${email}$`, 'i') };
      const bookings = await Booking.find(query).sort({ createdAt: -1 }).lean();
      return res.json({ bookings });
    }

    let bookings = readData('bookings.json');
    if (userId) bookings = bookings.filter(b => b.userId === userId);
    else if (email) bookings = bookings.filter(b => b.contact?.email?.toLowerCase() === email.toLowerCase());
    res.json({ bookings });
  } catch (error) {
    console.error('Get bookings error:', error);
    res.status(500).json({ message: 'Error retrieving bookings' });
  }
});

// ─── GET /api/bookings/:pnrOrId — Lookup by PNR or ID ───
router.get('/:pnrOrId', async (req, res) => {
  try {
    const query = req.params.pnrOrId.toUpperCase();

    if (isMongoConnected()) {
      const booking = await Booking.findOne({ $or: [{ pnr: query }, { id: query }] }).lean();
      if (!booking) return res.status(404).json({ message: 'Booking not found with reference ' + query });
      return res.json({ booking });
    }

    const bookings = readData('bookings.json');
    const booking = bookings.find(b => b.pnr?.toUpperCase() === query || b.id?.toUpperCase() === query);
    if (!booking) return res.status(404).json({ message: 'Booking not found with reference ' + query });
    res.json({ booking });
  } catch (error) {
    console.error('Get booking error:', error);
    res.status(500).json({ message: 'Error retrieving booking' });
  }
});

// ─── PUT /api/bookings/:pnrOrId/cancel ───
router.put('/:pnrOrId/cancel', async (req, res) => {
  try {
    const query = req.params.pnrOrId.toUpperCase();

    if (isMongoConnected()) {
      const booking = await Booking.findOne({ $or: [{ pnr: query }, { id: query }] });
      if (!booking) return res.status(404).json({ message: 'Booking not found' });
      if (booking.status === 'CANCELLED') return res.status(400).json({ message: 'Booking is already cancelled' });

      const refundAmount = Math.round(booking.totalAmount * 0.9);
      booking.status = 'CANCELLED';
      booking.cancelledAt = new Date().toISOString();
      booking.refundAmount = refundAmount;
      await booking.save();

      return res.json({ message: 'Booking cancelled. Refund initiated.', refundAmount, booking: booking.toObject() });
    }

    const bookings = readData('bookings.json');
    const idx = bookings.findIndex(b => b.pnr?.toUpperCase() === query || b.id?.toUpperCase() === query);
    if (idx === -1) return res.status(404).json({ message: 'Booking not found' });
    if (bookings[idx].status === 'CANCELLED') return res.status(400).json({ message: 'Booking is already cancelled' });

    const refundAmount = Math.round(bookings[idx].totalAmount * 0.9);
    bookings[idx].status = 'CANCELLED';
    bookings[idx].cancelledAt = new Date().toISOString();
    bookings[idx].refundAmount = refundAmount;
    writeData('bookings.json', bookings);
    res.json({ message: 'Booking cancelled. Refund initiated.', refundAmount, booking: bookings[idx] });
  } catch (error) {
    console.error('Cancel booking error:', error);
    res.status(500).json({ message: 'Error cancelling booking' });
  }
});

// ─── PUT /api/bookings/:pnrOrId/checkin ───
router.put('/:pnrOrId/checkin', async (req, res) => {
  try {
    const query = req.params.pnrOrId.toUpperCase();

    if (isMongoConnected()) {
      const booking = await Booking.findOne({ $or: [{ pnr: query }, { id: query }] });
      if (!booking) return res.status(404).json({ message: 'Booking not found with reference ' + query });
      if (booking.status === 'CANCELLED') return res.status(400).json({ message: 'Cannot check in for a cancelled booking' });

      booking.webCheckin = {
        checkedIn: true,
        checkinTime: new Date(),
        digitalBoardingPassUrl: `https://skywings.app/boarding/${booking.pnr}`
      };
      booking.status = 'CHECKED_IN';
      await booking.save();

      return res.json({ message: 'Web check-in confirmed! Your boarding pass has been issued.', booking: booking.toObject() });
    }

    const bookings = readData('bookings.json');
    const idx = bookings.findIndex(b => b.pnr?.toUpperCase() === query || b.id?.toUpperCase() === query);
    if (idx === -1) return res.status(404).json({ message: 'Booking not found' });
    if (bookings[idx].status === 'CANCELLED') return res.status(400).json({ message: 'Cannot check in for a cancelled booking' });

    bookings[idx].checkedIn = true;
    bookings[idx].checkInTime = new Date().toISOString();
    bookings[idx].digitalPassIssued = true;
    bookings[idx].securityClearanceCode = `SEC-${Math.floor(1000 + Math.random() * 9000)}`;
    writeData('bookings.json', bookings);
    res.json({ message: 'Web check-in confirmed! Your boarding pass has been issued.', booking: bookings[idx] });
  } catch (error) {
    console.error('Check-in error:', error);
    res.status(500).json({ message: 'Error processing web check-in' });
  }
});

export default router;
