async function testBooking() {
  try {
    const res = await fetch('http://localhost:5000/api/bookings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        userId: 'GUEST',
        flightId: 'flight_default_787',
        cabinClass: 'economy',
        departureDate: '2026-10-10',
        passengers: [
          {
            firstName: 'Alex',
            lastName: 'Morgan',
            age: 28,
            gender: 'Male',
            passport: '12345',
            meal: 'Standard Meal',
            seat: '12A'
          }
        ],
        contact: {
          email: 'test@example.com',
          phone: '12345'
        },
        addons: {},
        totalAmount: 500,
        currency: 'USD',
        paymentMethod: 'Credit Card (ending 4242)',
        flightMeta: {
          flightNumber: 'AL-202',
          airline: 'AeroLux Global',
          from: 'JFK',
          fromCity: 'New York',
          to: 'DXB',
          toCity: 'Dubai',
          departureTime: '18:45',
          arrivalTime: '11:30'
        }
      })
    });
    const text = await res.text();
    console.log(res.status, text);
  } catch(e) {
    console.error(e);
  }
}

testBooking();
