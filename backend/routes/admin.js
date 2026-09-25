import express from 'express';
import { readData, writeData } from '../utils/db.js';

const router = express.Router();


// Get Admin Overview Stats
router.get('/stats', (req, res) => {
  try {
    const bookings = readData('bookings.json');
    const flights = readData('flights.json');
    const users = readData('users.json');

    const confirmedBookings = bookings.filter(b => b.status === 'CONFIRMED');
    const totalRevenue = confirmedBookings.reduce((sum, b) => sum + (b.totalAmount || 0), 0);
    const totalPassengers = confirmedBookings.reduce((sum, b) => sum + (b.passengers?.length || 1), 0);

    // Group bookings by airline
    const airlineStats = {};
    bookings.forEach(b => {
      airlineStats[b.airline] = (airlineStats[b.airline] || 0) + 1;
    });

    res.json({
      metrics: {
        totalRevenue,
        totalBookings: bookings.length,
        confirmedBookings: confirmedBookings.length,
        cancelledBookings: bookings.filter(b => b.status === 'CANCELLED').length,
        totalFlights: flights.length,
        totalPassengers,
        registeredUsers: users.length
      },
      recentBookings: bookings.slice(0, 10),
      flights,
      airlineStats
    });
  } catch (error) {
    console.error('Admin stats error:', error);
    res.status(500).json({ message: 'Error computing admin statistics' });
  }
});

// Add New Flight
router.post('/flights', (req, res) => {
  try {
    const flights = readData('flights.json');
    const {
      flightNumber,
      airline,
      from,
      fromCity,
      to,
      toCity,
      departureTime,
      arrivalTime,
      duration,
      aircraft,
      basePrice,
      pricing
    } = req.body;

    if (!flightNumber || !airline || !from || !to || !basePrice) {
      return res.status(400).json({ message: 'Missing required flight fields' });
    }

    const newFlight = {
      id: `FL-${Date.now().toString(36).toUpperCase()}`,
      flightNumber,
      airline,
      airlineLogo: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=100&auto=format&fit=crop&q=80',
      from: from.toUpperCase(),
      fromCity: fromCity || from,
      to: to.toUpperCase(),
      toCity: toCity || to,
      departureTime: departureTime || '10:00',
      arrivalTime: arrivalTime || '14:00',
      duration: duration || '4h 00m',
      stops: 0,
      stopDetails: 'Non-stop',
      aircraft: aircraft || 'Boeing 787-9',
      basePrice: parseFloat(basePrice),
      pricing: pricing || {
        economy: parseFloat(basePrice),
        premium_economy: Math.round(parseFloat(basePrice) * 1.5),
        business: Math.round(parseFloat(basePrice) * 3),
        first: Math.round(parseFloat(basePrice) * 5)
      },
      availableSeats: 50,
      baggage: '1 checked bag + carry-on',
      mealsIncluded: true,
      wifiAvailable: true,
      status: 'On Time',
      gate: 'A' + Math.floor(1 + Math.random() * 20),
      terminal: '1'
    };

    flights.unshift(newFlight);
    writeData('flights.json', flights);

    res.status(201).json({
      message: 'Flight added successfully',
      flight: newFlight
    });
  } catch (error) {
    console.error('Add flight error:', error);
    res.status(500).json({ message: 'Failed to add flight' });
  }
});

// Update Flight Status (e.g. On Time, Delayed, Cancelled, Boarding)
router.patch('/flights/:id/status', (req, res) => {
  try {
    const { status, gate, terminal } = req.body;
    const flights = readData('flights.json');
    const index = flights.findIndex(f => f.id === req.params.id);

    if (index === -1) {
      return res.status(404).json({ message: 'Flight not found' });
    }

    if (status) flights[index].status = status;
    if (gate) flights[index].gate = gate;
    if (terminal) flights[index].terminal = terminal;

    writeData('flights.json', flights);

    res.json({
      message: 'Flight updated successfully',
      flight: flights[index]
    });
  } catch (error) {
    console.error('Update flight error:', error);
    res.status(500).json({ message: 'Failed to update flight status' });
  }
});

// Delete Flight
router.delete('/flights/:id', (req, res) => {
  try {
    let flights = readData('flights.json');
    const initialLength = flights.length;
    flights = flights.filter(f => f.id !== req.params.id);

    if (flights.length === initialLength) {
      return res.status(404).json({ message: 'Flight not found' });
    }

    writeData('flights.json', flights);
    res.json({ message: 'Flight removed successfully' });
  } catch (error) {
    console.error('Delete flight error:', error);
    res.status(500).json({ message: 'Failed to delete flight' });
  }
});

export default router;
