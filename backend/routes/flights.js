import express from 'express';
import { readData, writeData } from '../utils/db.js';

const router = express.Router();

// Get Airports
router.get('/airports', (req, res) => {
  const airports = readData('airports.json');
  res.json({ airports });
});

// Get Featured Destinations / Deals
router.get('/featured', (req, res) => {
  const destinations = [
    {
      city: 'Dubai',
      code: 'DXB',
      country: 'United Arab Emirates',
      image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=600&auto=format&fit=crop&q=80',
      fromPrice: 510,
      description: 'Futuristic skyline, luxury shopping, and desert safaris'
    },
    {
      city: 'London',
      code: 'LHR',
      country: 'United Kingdom',
      image: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=600&auto=format&fit=crop&q=80',
      fromPrice: 590,
      description: 'Rich history, world-class theater, and royal landmarks'
    },
    {
      city: 'Tokyo',
      code: 'HND',
      country: 'Japan',
      image: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?w=600&auto=format&fit=crop&q=80',
      fromPrice: 530,
      description: 'Neon-lit streets, historic temples, and exquisite cuisine'
    },
    {
      city: 'Paris',
      code: 'CDG',
      country: 'France',
      image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=600&auto=format&fit=crop&q=80',
      fromPrice: 640,
      description: 'City of light, art, couture fashion, and romance'
    },
    {
      city: 'Singapore',
      code: 'SIN',
      country: 'Singapore',
      image: 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=600&auto=format&fit=crop&q=80',
      fromPrice: 750,
      description: 'Futuristic gardens, street food paradise, and Marina Bay'
    },
    {
      city: 'Sydney',
      code: 'SYD',
      country: 'Australia',
      image: 'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?w=600&auto=format&fit=crop&q=80',
      fromPrice: 620,
      description: 'Iconic Opera House, golden beaches, and coastal walks'
    }
  ];
  res.json({ featured: destinations, destinations });
});


// Fare Calendar Matrix (7-day lowest fare prediction)
router.get('/fare-calendar', (req, res) => {
  try {
    const { from = 'JFK', to = 'DXB', date, cabinClass = 'economy' } = req.query;
    const flights = readData('flights.json');

    // Find route flights or fallback base price
    const routeFlights = flights.filter(f =>
      (f.from.toUpperCase() === from.toUpperCase() || f.fromCity.toLowerCase().includes(from.toLowerCase())) &&
      (f.to.toUpperCase() === to.toUpperCase() || f.toCity.toLowerCase().includes(to.toLowerCase()))
    );

    const baseFare = routeFlights.length > 0
      ? Math.min(...routeFlights.map(f => (f.pricing && f.pricing[cabinClass]) || f.basePrice))
      : (cabinClass === 'first' ? 3800 : cabinClass === 'business' ? 2200 : cabinClass === 'premium_economy' ? 1100 : 540);

    const centerDate = date ? new Date(date) : new Date();
    if (isNaN(centerDate.getTime())) {
      centerDate.setTime(Date.now() + 7 * 86400000);
    }

    const dayMultipliers = [-3, -2, -1, 0, 1, 2, 3];
    const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    const calendarDays = dayMultipliers.map((offset, idx) => {
      const d = new Date(centerDate);
      d.setDate(d.getDate() + offset);
      const dayName = daysOfWeek[d.getDay()];
      const monthName = months[d.getMonth()];
      const dayNum = d.getDate();
      const dateStr = d.toISOString().split('T')[0];

      // Weekend vs weekday price variance
      const isWeekend = d.getDay() === 0 || d.getDay() === 6;
      const isTuesdayOrWed = d.getDay() === 2 || d.getDay() === 3;
      
      let variance = 0;
      if (isTuesdayOrWed) variance = -0.14; // Cheaper mid-week
      else if (isWeekend) variance = 0.12;  // Higher weekends
      else variance = (idx % 2 === 0 ? -0.05 : 0.04);

      const calculatedPrice = Math.round(baseFare * (1 + variance));

      return {
        date: dateStr,
        dayName,
        displayDate: `${dayName}, ${monthName} ${dayNum}`,
        price: calculatedPrice,
        isCheapest: false,
        isCurrent: offset === 0
      };
    });

    let minPrice = Infinity;
    calendarDays.forEach(d => {
      if (d.price < minPrice) minPrice = d.price;
    });
    calendarDays.forEach(d => {
      if (d.price === minPrice) d.isCheapest = true;
    });

    const averagePrice = Math.round(calendarDays.reduce((acc, c) => acc + c.price, 0) / calendarDays.length);
    const savings = Math.max(0, averagePrice - minPrice);

    res.json({
      from,
      to,
      cabinClass,
      calendarDays,
      analytics: {
        trend: minPrice < averagePrice * 0.95 ? 'low' : 'typical',
        advice: 'Prices are currently lower than average for this route. We recommend booking soon.',
        averagePrice,
        typicalRange: `$${Math.round(averagePrice * 0.9)} - $${Math.round(averagePrice * 1.25)}`,
        potentialSavings: savings
      }
    });
  } catch (err) {
    console.error('Fare calendar error:', err);
    res.status(500).json({ message: 'Error calculating fare calendar' });
  }
});

// Destination Guide & Weather Telemetry
router.get('/destination-guide/:code', (req, res) => {
  const code = (req.params.code || 'DXB').toUpperCase();
  
  const guideDatabase = {
    DXB: {
      code: 'DXB',
      city: 'Dubai',
      country: 'United Arab Emirates',
      airport: 'Dubai International Airport',
      tagline: 'The Oasis of Extravagance & Architectural Wonders',
      weather: {
        tempC: 32,
        tempF: 90,
        condition: 'Sunny & Clear',
        humidity: '42%',
        windSpeed: '14 km/h',
        icon: 'sun'
      },
      timeZone: {
        name: 'Gulf Standard Time (GST)',
        utcOffset: '+4:00',
        difference: 'UTC+4'
      },
      terminals: [
        { name: 'Terminal 3', airlines: 'Emirates, flydubai', notes: 'World largest airport terminal building with luxury duty-free.' },
        { name: 'Terminal 1', airlines: 'All major international airlines', notes: 'Connected via automated airport train.' }
      ],
      transit: [
        { type: 'Dubai Metro (Red Line)', cost: '$2.20 - $3.50', duration: '24 mins to Burj Khalifa / Downtown', tip: 'Purchase a Silver Nol Card at station.' },
        { type: 'Airport Taxi', cost: '$8 base + $0.55/km', duration: '15-20 mins', tip: 'Cream-colored airport taxis accept Apple Pay and credit cards.' },
        { type: 'Careem / Uber', cost: '$25 - $40', duration: '20 mins', tip: 'Designated pick-up zone in parking structure.' }
      ],
      highlights: ['Burj Khalifa & Dubai Fountain', 'Museum of the Future', 'Palm Jumeirah', 'Dubai Mall & Gold Souk'],
      currency: { name: 'UAE Dirham (AED)', symbol: 'AED', rateHint: '1 USD ≈ 3.67 AED' },
      visaNote: 'Visa on arrival granted free of charge for EU, US, UK, GCC, and 60+ countries.'
    },
    LHR: {
      code: 'LHR',
      city: 'London',
      country: 'United Kingdom',
      airport: 'London Heathrow Airport',
      tagline: 'Royal Heritage, Global Culture & Historic Charm',
      weather: {
        tempC: 18,
        tempF: 64,
        condition: 'Mild & Partly Cloudy',
        humidity: '65%',
        windSpeed: '16 km/h',
        icon: 'cloud-sun'
      },
      timeZone: {
        name: 'British Summer Time (BST) / GMT',
        utcOffset: '+1:00',
        difference: 'UTC+1'
      },
      terminals: [
        { name: 'Terminal 5', airlines: 'British Airways Flagship Hub', notes: 'Concourses A, B, and C connected by transit train.' },
        { name: 'Terminal 2 & 3', airlines: 'Star Alliance, Virgin Atlantic, Delta', notes: 'Central terminal area with pedestrian tunnels.' }
      ],
      transit: [
        { type: 'Heathrow Express', cost: '$32 (£25)', duration: '15 mins non-stop to London Paddington', tip: 'Fastest link to central London.' },
        { type: 'Elizabeth Line', cost: '$16 (£12.80)', duration: '28 mins to Tottenham Court Road', tip: 'High-speed air-conditioned cross-city trains.' },
        { type: 'Piccadilly Line Tube', cost: '$7 (£5.50)', duration: '50 mins to Piccadilly Circus', tip: 'Cheapest transit, runs every 5 minutes.' }
      ],
      highlights: ['Tower Bridge & Tower of London', 'Big Ben & Palace of Westminster', 'British Museum', 'Hyde Park'],
      currency: { name: 'British Pound Sterling (GBP)', symbol: '£', rateHint: '1 USD ≈ 0.77 GBP' },
      visaNote: 'Electronic Travel Authorisation (ETA) or passport scan at e-Gates available.'
    },
    HND: {
      code: 'HND',
      city: 'Tokyo',
      country: 'Japan',
      airport: 'Tokyo Haneda International Airport',
      tagline: 'Where Ancient Traditions Meet High-Speed Innovation',
      weather: {
        tempC: 22,
        tempF: 72,
        condition: 'Clear & Crisp',
        humidity: '50%',
        windSpeed: '10 km/h',
        icon: 'sun'
      },
      timeZone: {
        name: 'Japan Standard Time (JST)',
        utcOffset: '+9:00',
        difference: 'UTC+9'
      },
      terminals: [
        { name: 'Terminal 3', airlines: 'International Arrivals & Departures', notes: 'Edo Ko-ji traditional market street on 4th floor.' }
      ],
      transit: [
        { type: 'Tokyo Monorail', cost: '$3.50 (¥500)', duration: '13 mins to Hamamatsucho Station', tip: 'Scenic elevated train with Tokyo Bay views.' },
        { type: 'Keikyu Airport Line', cost: '$3.20 (¥460)', duration: '11 mins to Shinagawa Station', tip: 'Direct connections to Asakusa subway line.' },
        { type: 'Airport Limousine Bus', cost: '$9 - $12', duration: '25-40 mins to major hotels', tip: 'Luggage handled directly to your hotel lobby.' }
      ],
      highlights: ['Shinjuku & Shibuya Crossing', 'Senso-ji Temple Asakusa', 'Tsukiji Outer Fish Market', 'Tokyo Skytree'],
      currency: { name: 'Japanese Yen (JPY)', symbol: '¥', rateHint: '1 USD ≈ 152 JPY' },
      visaNote: 'Visa-free tourist entry for up to 90 days for eligible nationalities.'
    },
    CDG: {
      code: 'CDG',
      city: 'Paris',
      country: 'France',
      airport: 'Charles de Gaulle Airport',
      tagline: 'The Capital of Haute Couture, Fine Art & Romance',
      weather: {
        tempC: 19,
        tempF: 66,
        condition: 'Pleasantly Mild',
        humidity: '58%',
        windSpeed: '12 km/h',
        icon: 'cloud-sun'
      },
      timeZone: {
        name: 'Central European Summer Time (CEST)',
        utcOffset: '+2:00',
        difference: 'UTC+2'
      },
      terminals: [
        { name: 'Terminal 2E / 2F', airlines: 'Air France & SkyTeam', notes: 'Gourmet French bakeries and Ladurée macaron boutiques.' }
      ],
      transit: [
        { type: 'RER B Express Train', cost: '€11.80 ($12.50)', duration: '32 mins to Paris Gare du Nord', tip: 'Direct city connection every 10 mins.' },
        { type: 'RoissyBus to Opéra', cost: '€16.20', duration: '60 mins', tip: 'Drops off directly in front of Palais Garnier.' },
        { type: 'Official Paris Taxi', cost: '€56 Flat Rate to Right Bank / €65 to Left Bank', duration: '45 mins', tip: 'Always use official taxi line outside arrivals.' }
      ],
      highlights: ['Eiffel Tower & Champ de Mars', 'Louvre Museum & Musée d\'Orsay', 'Notre-Dame & Montmartre', 'Champs-Élysées'],
      currency: { name: 'Euro (EUR)', symbol: '€', rateHint: '1 USD ≈ 0.92 EUR' },
      visaNote: 'Schengen Area border rules apply; e-Gates available for biometric passports.'
    },
    SIN: {
      code: 'SIN',
      city: 'Singapore',
      country: 'Singapore',
      airport: 'Singapore Changi Airport',
      tagline: 'The Garden City of Tropical Greenery & Supertrees',
      weather: {
        tempC: 30,
        tempF: 86,
        condition: 'Warm Tropical',
        humidity: '78%',
        windSpeed: '8 km/h',
        icon: 'sun'
      },
      timeZone: {
        name: 'Singapore Standard Time (SGT)',
        utcOffset: '+8:00',
        difference: 'UTC+8'
      },
      terminals: [
        { name: 'Jewel Changi', airlines: 'Accessible from all terminals', notes: 'Home to the HSBC Rain Vortex, world\'s tallest indoor waterfall.' }
      ],
      transit: [
        { type: 'MRT Subway (East-West Line)', cost: '$2.00 SGD', duration: '28 mins to City Hall', tip: 'Tap your contactless credit card directly at fare gates.' },
        { type: 'Grab / Taxi', cost: '$18 - $28 SGD', duration: '20 mins to Marina Bay', tip: 'Convenient 24/7 pickup at all terminal basements.' }
      ],
      highlights: ['Gardens by the Bay & Cloud Forest', 'Marina Bay Sands SkyPark', 'Chinatown & Little India', 'Sentosa Island'],
      currency: { name: 'Singapore Dollar (SGD)', symbol: 'S$', rateHint: '1 USD ≈ 1.34 SGD' },
      visaNote: 'Submit Singapore Arrival Card (SGAC) online up to 3 days prior to arrival.'
    },
    JFK: {
      code: 'JFK',
      city: 'New York',
      country: 'United States',
      airport: 'John F. Kennedy International Airport',
      tagline: 'The Gateway to the Empire City That Never Sleeps',
      weather: {
        tempC: 21,
        tempF: 70,
        condition: 'Partly Sunny',
        humidity: '54%',
        windSpeed: '15 km/h',
        icon: 'sun'
      },
      timeZone: {
        name: 'Eastern Daylight Time (EDT)',
        utcOffset: '-4:00',
        difference: 'UTC-4'
      },
      terminals: [
        { name: 'Terminal 4 & 7', airlines: 'Delta, Virgin, Emirates', notes: 'Extensive shopping, rooftop lounges, and AirTrain links.' }
      ],
      transit: [
        { type: 'AirTrain + NYC Subway (E/J/Z or A)', cost: '$11.40 ($8.50 AirTrain + $2.90 Metro)', duration: '50 mins to Midtown Manhattan', tip: 'Use OMNY contactless tap to pay.' },
        { type: 'LIRR (Long Island Rail Road)', cost: '$13 - $16.50', duration: '35 mins from Jamaica to Grand Central / Penn Station', tip: 'Fastest rail transit into Manhattan.' },
        { type: 'NYC Yellow Taxi', cost: '$70 Flat Rate + Tolls & Tip (~$95 total)', duration: '45-60 mins', tip: 'Ignore solicitors; join the official dispatcher taxi stand.' }
      ],
      highlights: ['Times Square & Broadway', 'Central Park', 'Empire State Building & The Edge', 'Statue of Liberty & Brooklyn Bridge'],
      currency: { name: 'US Dollar (USD)', symbol: '$', rateHint: 'Base Currency' },
      visaNote: 'ESTA or US Tourist Visa required prior to flight check-in.'
    }
  };

  const defaultGuide = {
    code,
    city: code,
    country: 'International Destination',
    airport: `${code} International Airport`,
    tagline: 'Global Travel Hub & Cultural Experience',
    weather: {
      tempC: 23,
      tempF: 73,
      condition: 'Clear Skies',
      humidity: '55%',
      windSpeed: '12 km/h',
      icon: 'sun'
    },
    timeZone: {
      name: 'Local Time Zone',
      utcOffset: '+0:00',
      difference: 'Local Standard'
    },
    terminals: [
      { name: 'Main Terminal', airlines: 'All Carriers', notes: 'Modern passenger concourse with duty-free amenities.' }
    ],
    transit: [
      { type: 'Airport Express Rail / Metro', cost: '$5 - $12', duration: '25-35 mins to downtown', tip: 'Direct station located inside terminal.' },
      { type: 'Licensed Airport Taxi', cost: '$25 - $50', duration: '20-40 mins', tip: 'Metered rates available at designated taxi ranks.' }
    ],
    highlights: ['City Center Historic Square', 'Cultural Museums', 'Local Culinary Markets'],
    currency: { name: 'Local Currency', symbol: '$', rateHint: 'Check current exchange rate' },
    visaNote: 'Ensure valid passport with at least 6 months validity.'
  };

  res.json({ guide: guideDatabase[code] || defaultGuide });
});

// Price Alerts Subscription Endpoint
router.post('/price-alerts', (req, res) => {
  try {
    const { email, from, to, targetPrice, cabinClass = 'economy' } = req.body;
    if (!email || !from || !to) {
      return res.status(400).json({ message: 'Email, origin, and destination are required' });
    }

    const alerts = readData('alerts.json') || [];
    const newAlert = {
      id: `ALT-${Date.now().toString(36).toUpperCase()}`,
      email,
      from: from.toUpperCase(),
      to: to.toUpperCase(),
      targetPrice: targetPrice || 800,
      cabinClass,
      active: true,
      createdAt: new Date().toISOString()
    };

    alerts.push(newAlert);
    writeData('alerts.json', alerts);

    res.status(201).json({
      message: `Price alert set! We will email you at ${email} when fares drop below $${newAlert.targetPrice}.`,
      alert: newAlert
    });
  } catch (err) {
    console.error('Price alert error:', err);
    res.status(500).json({ message: 'Failed to create price alert' });
  }
});

// Get User Price Alerts
router.get('/price-alerts', (req, res) => {
  const { email } = req.query;
  const alerts = readData('alerts.json') || [];
  if (email) {
    return res.json({ alerts: alerts.filter(a => a.email.toLowerCase() === email.toLowerCase()) });
  }
  res.json({ alerts });
});

// Baggage Rules Reference
router.get('/baggage-rules', (req, res) => {
  res.json({
    rules: [
      {
        cabin: 'Economy Class',
        carryOn: '1 bag (up to 7kg / 15lbs) + 1 small personal item (handbag/laptop bag)',
        checked: '1 piece up to 23kg (50lbs), max dimensions 158cm (62 in) total',
        overweightFee: '$45 per bag for 24-32kg',
        extraPieceFee: '$65 for 2nd checked piece'
      },
      {
        cabin: 'Premium Economy',
        carryOn: '1 bag (up to 10kg / 22lbs) + 1 personal item',
        checked: '2 pieces up to 23kg (50lbs) each (46kg total)',
        overweightFee: '$40 per bag for 24-32kg',
        extraPieceFee: '$70 for 3rd checked piece'
      },
      {
        cabin: 'Business Class',
        carryOn: '2 bags (up to 10kg each / 20kg total) + 1 garment bag',
        checked: '2 pieces up to 32kg (70lbs) each (64kg total included)',
        overweightFee: 'Complimentary up to 32kg',
        extraPieceFee: '$80 for additional piece'
      },
      {
        cabin: 'First Class Suite',
        carryOn: '2 bags (up to 12kg each) + 1 personal bag',
        checked: '3 pieces up to 32kg (70lbs) each (96kg total included)',
        overweightFee: 'Zero overweight fees',
        extraPieceFee: '$90 for additional piece'
      }
    ],
    prohibitedItems: [
      'Lithium batteries exceeding 160Wh (must be in carry-on, never checked)',
      'Liquids exceeding 100ml in carry-on (must fit in 1-quart transparent bag)',
      'Flammable liquids, flares, fireworks, or compressed gas cylinders',
      'Sharp items, blades, or scissors with blades over 6cm in cabin luggage'
    ]
  });
});

// Live Status Tracking
router.get('/status/:query', (req, res) => {
  const query = req.params.query.toUpperCase();
  const flights = readData('flights.json');

  const match = flights.find(f => 
    f.flightNumber.toUpperCase() === query || 
    f.id.toUpperCase() === query ||
    `${f.from}-${f.to}`.toUpperCase() === query
  );

  if (!match) {
    return res.status(404).json({ message: 'Flight not found for status lookup' });
  }

  const progressMap = {
    'Scheduled': 10,
    'Boarding': 25,
    'Departed': 45,
    'In Flight': 70,
    'On Time': 55,
    'Delayed (25m)': 30,
    'Landed': 100
  };

  res.json({
    flight: match,
    liveStatus: {
      status: match.status || 'On Time',
      progressPercent: progressMap[match.status] || 50,
      altitude: '36,000 ft',
      groundSpeed: '540 mph',
      estimatedArrival: match.arrivalTime,
      baggageBelt: 'Carousel 4'
    }
  });
});

// Search & Filter Flights
router.get('/', (req, res) => {
  try {
    let flights = readData('flights.json');
    const { from, to, date, cabinClass = 'economy', stops, maxPrice, airline, sort } = req.query;

    if (from && from !== 'ALL') {
      flights = flights.filter(f => 
        f.from.toUpperCase() === from.toUpperCase() || 
        f.fromCity.toLowerCase().includes(from.toLowerCase())
      );
    }

    if (to && to !== 'ALL') {
      flights = flights.filter(f => 
        f.to.toUpperCase() === to.toUpperCase() || 
        f.toCity.toLowerCase().includes(to.toLowerCase())
      );
    }

    if (stops !== undefined && stops !== '' && stops !== 'all') {
      const stopNum = parseInt(stops, 10);
      flights = flights.filter(f => f.stops === stopNum);
    }

    if (airline && airline !== 'all') {
      flights = flights.filter(f => f.airline.toLowerCase() === airline.toLowerCase());
    }

    flights = flights.map(f => {
      const classPrice = f.pricing && f.pricing[cabinClass] ? f.pricing[cabinClass] : f.basePrice;
      return {
        ...f,
        selectedClass: cabinClass,
        price: classPrice
      };
    });

    if (maxPrice) {
      const priceCap = parseFloat(maxPrice);
      flights = flights.filter(f => f.price <= priceCap);
    }

    if (sort === 'cheapest') {
      flights.sort((a, b) => a.price - b.price);
    } else if (sort === 'fastest') {
      const getMinutes = (durStr) => {
        const parts = durStr.match(/(\d+)h\s*(\d+)?m?/);
        if (!parts) return 9999;
        const h = parseInt(parts[1] || '0', 10);
        const m = parseInt(parts[2] || '0', 10);
        return h * 60 + m;
      };
      flights.sort((a, b) => getMinutes(a.duration) - getMinutes(b.duration));
    } else if (sort === 'departure') {
      flights.sort((a, b) => a.departureTime.localeCompare(b.departureTime));
    }

    res.json({
      count: flights.length,
      searchDate: date || null,
      flights
    });

  } catch (error) {
    console.error('Flights search error:', error);
    res.status(500).json({ message: 'Error searching flights' });
  }
});

// Single Flight
router.get('/:id', (req, res) => {
  const flights = readData('flights.json');
  const flight = flights.find(f => f.id === req.params.id);
  if (!flight) {
    return res.status(404).json({ message: 'Flight not found' });
  }
  res.json({ flight });
});

// Flight Seat Map Generation
router.get('/:id/seats', (req, res) => {
  const flightId = req.params.id;
  const flights = readData('flights.json');
  const flight = flights.find(f => f.id === flightId);

  if (!flight) {
    return res.status(404).json({ message: 'Flight not found' });
  }

  const bookings = readData('bookings.json');
  const occupiedSeats = new Set();
  
  bookings.filter(b => b.flightId === flightId && b.status !== 'CANCELLED').forEach(b => {
    b.passengers.forEach(p => {
      if (p.seat) occupiedSeats.add(p.seat);
    });
  });

  const defaultOccupied = ['1A', '2B', '3F', '5A', '7C', '8D', '12A', '14C', '15F', '18B', '20D'];
  defaultOccupied.forEach(s => occupiedSeats.add(s));

  const cabinRows = [];

  // Rows 1-3: First Class
  for (let r = 1; r <= 3; r++) {
    const letters = ['A', 'D', 'G', 'K'];
    const seats = letters.map(letter => {
      const code = `${r}${letter}`;
      return {
        code,
        row: r,
        letter,
        cabin: 'first',
        type: letter === 'A' || letter === 'K' ? 'window' : 'aisle',
        isOccupied: occupiedSeats.has(code),
        additionalCost: 200,
        legroom: '82 inch Lie-flat Suite'
      };
    });
    cabinRows.push({ rowNumber: r, cabin: 'first', seats });
  }

  // Rows 4-8: Business Class
  for (let r = 4; r <= 8; r++) {
    const letters = ['A', 'B', 'D', 'G', 'J', 'K'];
    const seats = letters.map(letter => {
      const code = `${r}${letter}`;
      return {
        code,
        row: r,
        letter,
        cabin: 'business',
        type: (letter === 'A' || letter === 'K') ? 'window' : (letter === 'B' || letter === 'J') ? 'aisle' : 'center',
        isOccupied: occupiedSeats.has(code),
        additionalCost: 80,
        legroom: '60 inch Lie-flat'
      };
    });
    cabinRows.push({ rowNumber: r, cabin: 'business', seats });
  }

  // Rows 9-24: Economy Class
  for (let r = 9; r <= 24; r++) {
    const letters = ['A', 'B', 'C', 'D', 'E', 'F', 'H', 'J', 'K'];
    const isExitRow = r === 12 || r === 20;
    const seats = letters.map(letter => {
      const code = `${r}${letter}`;
      const isWindow = letter === 'A' || letter === 'K';
      const isAisle = letter === 'C' || letter === 'D' || letter === 'F' || letter === 'H';
      return {
        code,
        row: r,
        letter,
        cabin: 'economy',
        type: isWindow ? 'window' : isAisle ? 'aisle' : 'middle',
        isOccupied: occupiedSeats.has(code),
        additionalCost: isExitRow ? 35 : isWindow ? 15 : 0,
        legroom: isExitRow ? '38 inch Extra Legroom' : '32 inch Standard'
      };
    });
    cabinRows.push({ rowNumber: r, cabin: 'economy', isExitRow, seats });
  }

  res.json({
    flightId,
    aircraft: flight.aircraft,
    rows: cabinRows
  });
});

export default router;
