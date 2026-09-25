import express from 'express';
import { readData, writeData } from '../utils/db.js';

const router = express.Router();


// Helper to generate a 6-character unique PNR code
const generatePNR = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let pnr = 'SKW';
  for (let i = 0; i < 3; i++) {
    pnr += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return pnr;
};

// Create a new booking
router.post('/', (req, res) => {
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
      paymentMethod = 'Credit Card'
    } = req.body;

    if (!flightId || !passengers || passengers.length === 0) {
      return res.status(400).json({ message: 'Flight ID and passengers details are required' });
    }

    const flights = readData('flights.json');
    const flight = flights.find(f => f.id === flightId);

    if (!flight) {
      return res.status(404).json({ message: 'Selected flight not found' });
    }

    const bookings = readData('bookings.json');
    let pnr = generatePNR();
    while (bookings.some(b => b.pnr === pnr)) {
      pnr = generatePNR();
    }

    const newBooking = {
      id: `BKG-${Date.now().toString(36).toUpperCase()}`,
      pnr,
      userId: userId || 'GUEST',
      flightId: flight.id,
      flightNumber: flight.flightNumber,
      airline: flight.airline,
      airlineLogo: flight.airlineLogo,
      from: flight.from,
      fromCity: flight.fromCity,
      to: flight.to,
      toCity: flight.toCity,
      departureDate: departureDate || new Date().toISOString().split('T')[0],
      departureTime: flight.departureTime,
      arrivalTime: flight.arrivalTime,
      duration: flight.duration,
      aircraft: flight.aircraft,
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
      totalAmount: totalAmount || (flight.pricing?.[cabinClass] || flight.basePrice) * passengers.length,
      currency,
      paymentMethod,
      status: 'CONFIRMED',
      terminal: flight.terminal || '3',
      gate: flight.gate || 'B12',
      boardingTime: '45 mins before departure',
      createdAt: new Date().toISOString()
    };

    bookings.unshift(newBooking);
    writeData('bookings.json', bookings);

    // Update available seats on the flight
    if (flight.availableSeats >= passengers.length) {
      flight.availableSeats -= passengers.length;
      writeData('flights.json', flights);
    }

    res.status(201).json({
      message: 'Booking confirmed successfully!',
      booking: newBooking
    });
  } catch (error) {
    console.error('Create booking error:', error);
    res.status(500).json({ message: 'Internal server error while processing booking' });
  }
});

// Get user bookings
router.get('/', (req, res) => {
  try {
    const { userId, email } = req.query;
    let bookings = readData('bookings.json');

    if (userId) {
      bookings = bookings.filter(b => b.userId === userId);
    } else if (email) {
      bookings = bookings.filter(b => b.contact && b.contact.email.toLowerCase() === email.toLowerCase());
    }

    res.json({ bookings });
  } catch (error) {
    console.error('Get bookings error:', error);
    res.status(500).json({ message: 'Error retrieving bookings' });
  }
});

// Get booking by PNR or ID (Public / Boarding pass lookup)
router.get('/:pnrOrId', (req, res) => {
  const query = req.params.pnrOrId.toUpperCase();
  const bookings = readData('bookings.json');
  const booking = bookings.find(b => b.pnr.toUpperCase() === query || b.id.toUpperCase() === query);

  if (!booking) {
    return res.status(404).json({ message: 'Booking not found with reference ' + query });
  }

  res.json({ booking });
});

// Cancel a booking
router.put('/:pnrOrId/cancel', (req, res) => {
  try {
    const query = req.params.pnrOrId.toUpperCase();
    const bookings = readData('bookings.json');
    const bookingIndex = bookings.findIndex(b => b.pnr.toUpperCase() === query || b.id.toUpperCase() === query);

    if (bookingIndex === -1) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    if (bookings[bookingIndex].status === 'CANCELLED') {
      return res.status(400).json({ message: 'Booking is already cancelled' });
    }

    // Refund policy: 90% refund
    const refundAmount = Math.round(bookings[bookingIndex].totalAmount * 0.9);
    bookings[bookingIndex].status = 'CANCELLED';
    bookings[bookingIndex].cancelledAt = new Date().toISOString();
    bookings[bookingIndex].refundAmount = refundAmount;

    writeData('bookings.json', bookings);

    res.json({
      message: 'Booking cancelled successfully. Refund initiated.',
      refundAmount,
      booking: bookings[bookingIndex]
    });
  } catch (error) {
    console.error('Cancel booking error:', error);
    res.status(500).json({ message: 'Error cancelling booking' });
  }
});

// Online Web Check-In & Boarding Pass Issuance
router.put('/:pnrOrId/checkin', (req, res) => {
  try {
    const query = req.params.pnrOrId.toUpperCase();
    const bookings = readData('bookings.json');
    const bookingIndex = bookings.findIndex(b => b.pnr.toUpperCase() === query || b.id.toUpperCase() === query);

    if (bookingIndex === -1) {
      return res.status(404).json({ message: 'Booking not found with reference ' + query });
    }

    if (bookings[bookingIndex].status === 'CANCELLED') {
      return res.status(400).json({ message: 'Cannot check in for a cancelled flight booking' });
    }

    // Mark as checked in
    bookings[bookingIndex].checkedIn = true;
    bookings[bookingIndex].checkInTime = new Date().toISOString();
    bookings[bookingIndex].digitalPassIssued = true;
    bookings[bookingIndex].securityClearanceCode = `SEC-${Math.floor(1000 + Math.random() * 9000)}`;

    writeData('bookings.json', bookings);

    res.json({
      message: 'Web check-in confirmed! Your digital boarding pass has been issued.',
      booking: bookings[bookingIndex]
    });
  } catch (error) {
    console.error('Check-in error:', error);
    res.status(500).json({ message: 'Error processing web check-in' });
  }
});

export default router;
