import React, { useState, useEffect } from 'react';
import {
  Shield,
  Luggage,
  Sparkles,
  CreditCard,
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  Lock,
  Plane
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useCurrency } from '../context/CurrencyContext';
import '../styles/bookingPage.css';

const BookingPage = () => {
  const { user } = useAuth();
  const { formatPrice, currency } = useCurrency();

  const [session, setSession] = useState(null);
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Passengers details
  const [passengers, setPassengers] = useState([]);
  
  // Contact details
  const [contact, setContact] = useState({
    email: user?.email || '',
    phone: user?.phone || ''
  });

  // Add-ons
  const [addons, setAddons] = useState({
    travelInsurance: true,
    priorityBoarding: false,
    extraBaggage: 0
  });

  // Promo code
  const [promoCode, setPromoCode] = useState('');
  const [promoDiscount, setPromoDiscount] = useState(0);
  const [promoError, setPromoError] = useState('');
  const [promoSuccess, setPromoSuccess] = useState('');

  // Payment mock info
  const [cardNumber, setCardNumber] = useState('4242 •••• •••• 4242');
  const [cardExpiry, setCardExpiry] = useState('12/28');
  const [cardCvv, setCardCvv] = useState('888');
  const [cardHolder, setCardHolder] = useState(user?.name || 'Alex Morgan');

  useEffect(() => {
    // Load session from localStorage
    try {
      const rawSession = localStorage.getItem('skywings_checkout_session');
      if (rawSession) {
        const data = JSON.parse(rawSession);
        setSession(data);

        const count = data.passengersCount || 1;
        const seats = data.selectedSeats || [];
        setPassengers(
          Array.from({ length: count }, (_, idx) => ({
            firstName: idx === 0 && user?.name ? user.name.split(' ')[0] : '',
            lastName: idx === 0 && user?.name ? user.name.split(' ')[1] || '' : '',
            age: 28,
            gender: 'Male',
            passport: '',
            meal: 'Standard Meal',
            seat: seats[idx]?.code || `12${String.fromCharCode(65 + idx)}`
          }))
        );
      } else {
        // No session found, redirect to home
        window.location.href = '/';
      }
    } catch (err) {
      window.location.href = '/';
    }
  }, [user]);

  if (!session || !session.flight) return null;

  const { flight, cabinClass, seatExtrasCost, passengersCount } = session;
  const basePricePerPerson = flight.pricing?.[cabinClass] || flight.basePrice || 500;
  const subtotal = basePricePerPerson * passengersCount;
  const insurancePrice = addons.travelInsurance ? 29 * passengersCount : 0;
  const priorityPrice = addons.priorityBoarding ? 19 * passengersCount : 0;
  const baggagePrice = addons.extraBaggage * 45;
  const taxesAndFees = Math.round(subtotal * 0.12);
  const grossTotal = subtotal + seatExtrasCost + insurancePrice + priorityPrice + baggagePrice + taxesAndFees;
  const finalTotal = Math.max(10, grossTotal - promoDiscount);

  const handleApplyPromo = () => {
    setPromoError('');
    setPromoSuccess('');
    const code = promoCode.trim().toUpperCase();
    if (code === 'FLY2026' || code === 'SKYWINGS') {
      const discount = Math.round(subtotal * 0.15);
      setPromoDiscount(discount);
      setPromoSuccess(`15% discount applied (-${formatPrice(discount)})`);
    } else {
      setPromoError('Invalid promo code. Try FLY2026 for 15% off.');
    }
  };

  const updatePassenger = (index, field, value) => {
    const updated = [...passengers];
    updated[index][field] = value;
    setPassengers(updated);
  };

  const handlePayAndConfirm = async () => {
    setLoading(true);
    try {
      const bookingPayload = {
        userId: user?.id || 'GUEST',
        flightId: flight.id,
        cabinClass,
        departureDate: new Date().toISOString().split('T')[0], // Use today if no date in session
        passengers,
        contact,
        addons,
        totalAmount: finalTotal,
        currency,
        paymentMethod: 'Credit Card (ending 4242)',
        // Include flight metadata as fallback for demo/default flights not in DB
        flightMeta: {
          flightNumber: flight.flightNumber,
          airline: flight.airline,
          airlineLogo: flight.airlineLogo,
          from: flight.from,
          fromCity: flight.fromCity,
          to: flight.to,
          toCity: flight.toCity,
          departureTime: flight.departureTime,
          arrivalTime: flight.arrivalTime,
          duration: flight.duration,
          aircraft: flight.aircraft,
          basePrice: flight.basePrice,
          terminal: flight.terminal,
          gate: flight.gate
        }
      };

      const result = await api.createBooking(bookingPayload);

      // Fire confetti celebration immediately
      try {
        confetti({ particleCount: 140, spread: 80, origin: { y: 0.55 } });
        setTimeout(() => confetti({ particleCount: 60, spread: 120, origin: { y: 0.4 } }), 400);
      } catch (_e) {
        // Confetti fallback — ignore
      }

      // Save confirmed booking so the reservation page can read it from localStorage
      localStorage.setItem('skywings_confirmed_booking', JSON.stringify(result.booking));
      
      // Clean up checkout session
      localStorage.removeItem('skywings_checkout_session');

      // Navigate to the Ticket page within this same tab
      setTimeout(() => {
        window.history.pushState({}, '', '/ticket');
        window.dispatchEvent(new PopStateEvent('popstate'));
      }, 1000); // Small delay to enjoy the confetti
      
    } catch (err) {
      alert(err.message || 'Payment processing failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bp-root">
      <nav className="bp-navbar">
        <div className="bp-brand">
          <div className="bp-brand-dot" />
          SkyWings Airways
        </div>
        <div className="bp-route-pill">
          <span className="bp-route-code">{flight.from}</span>
          <Plane size={14} />
          <span className="bp-route-code">{flight.to}</span>
        </div>
        <div className="bp-secure-badge">
          <Lock size={14} /> Secure Checkout
        </div>
      </nav>

      <div className="bp-stepper-bar">
        <div className={`bp-step ${step === 1 ? 'active' : step > 1 ? 'completed' : ''}`}>
          <div className="bp-step-num">1</div>
          <span>Passenger Info</span>
        </div>
        <div className="bp-step-divider" />
        <div className={`bp-step ${step === 2 ? 'active' : step > 2 ? 'completed' : ''}`}>
          <div className="bp-step-num">2</div>
          <span>Add-ons</span>
        </div>
        <div className="bp-step-divider" />
        <div className={`bp-step ${step === 3 ? 'active' : step > 3 ? 'completed' : ''}`}>
          <div className="bp-step-num">3</div>
          <span>Payment</span>
        </div>
      </div>

      <div className="bp-body">
        <div className="bp-form-area">
          {/* STEP 1 */}
          {step === 1 && (
            <div className="bp-card">
              <div className="bp-card-title">
                <div className="bp-card-title-icon"><CreditCard size={18} /></div>
                Passenger Information
              </div>
              
              {passengers.map((p, idx) => (
                <div key={idx} className="bp-passenger-block">
                  <div className="bp-passenger-header">
                    <span>Passenger {idx + 1} (Adult)</span>
                    <span className="bp-seat-tag">Seat: {p.seat}</span>
                  </div>

                  <div className="bp-form-grid">
                    <div className="bp-form-group">
                      <label>First / Given Name</label>
                      <input
                        type="text"
                        className="bp-input"
                        placeholder="e.g. John"
                        value={p.firstName}
                        onChange={(e) => updatePassenger(idx, 'firstName', e.target.value)}
                        required
                      />
                    </div>
                    <div className="bp-form-group">
                      <label>Last / Surname</label>
                      <input
                        type="text"
                        className="bp-input"
                        placeholder="e.g. Doe"
                        value={p.lastName}
                        onChange={(e) => updatePassenger(idx, 'lastName', e.target.value)}
                        required
                      />
                    </div>
                    <div className="bp-form-group">
                      <label>Gender</label>
                      <select
                        className="bp-input"
                        value={p.gender}
                        onChange={(e) => updatePassenger(idx, 'gender', e.target.value)}
                      >
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    <div className="bp-form-group">
                      <label>Age</label>
                      <input
                        type="number"
                        min="1"
                        max="120"
                        className="bp-input"
                        value={p.age}
                        onChange={(e) => updatePassenger(idx, 'age', parseInt(e.target.value, 10))}
                      />
                    </div>
                    <div className="bp-form-group">
                      <label>Passport / National ID</label>
                      <input
                        type="text"
                        className="bp-input"
                        placeholder="e.g. A12345678"
                        value={p.passport}
                        onChange={(e) => updatePassenger(idx, 'passport', e.target.value)}
                      />
                    </div>
                    <div className="bp-form-group">
                      <label>Meal Preference</label>
                      <select
                        className="bp-input"
                        value={p.meal}
                        onChange={(e) => updatePassenger(idx, 'meal', e.target.value)}
                      >
                        <option value="Standard Meal">Standard Airline Meal</option>
                        <option value="Asian Vegetarian">Asian Vegetarian</option>
                        <option value="Vegan">Strict Vegan</option>
                        <option value="Halal">Halal Certified</option>
                        <option value="Kosher">Kosher</option>
                      </select>
                    </div>
                  </div>
                </div>
              ))}

              <div className="bp-card-title" style={{ marginTop: 32 }}>Booking Contact</div>
              <div className="bp-form-grid">
                <div className="bp-form-group">
                  <label>Email Address</label>
                  <input
                    type="email"
                    className="bp-input"
                    placeholder="email@example.com"
                    value={contact.email}
                    onChange={(e) => setContact({ ...contact, email: e.target.value })}
                  />
                </div>
                <div className="bp-form-group">
                  <label>Mobile Phone</label>
                  <input
                    type="tel"
                    className="bp-input"
                    placeholder="+1 (555) 000-0000"
                    value={contact.phone}
                    onChange={(e) => setContact({ ...contact, phone: e.target.value })}
                  />
                </div>
              </div>

              <div className="bp-nav-actions right" style={{ marginTop: 30 }}>
                <button type="button" className="bp-btn primary" onClick={() => setStep(2)}>
                  Continue to Add-ons <ArrowRight size={18} />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2 */}
          {step === 2 && (
            <div className="bp-card">
              <div className="bp-card-title">
                <div className="bp-card-title-icon"><Sparkles size={18} /></div>
                Enhance Your Journey
              </div>
              
              <div
                className={`bp-addon-card ${addons.travelInsurance ? 'selected' : ''}`}
                onClick={() => setAddons({ ...addons, travelInsurance: !addons.travelInsurance })}
              >
                <div className="bp-addon-left">
                  <div className="bp-addon-icon"><Shield size={20} /></div>
                  <div>
                    <div className="bp-addon-title">Comprehensive Travel & Medical Insurance</div>
                    <div className="bp-addon-desc">Trip cancellation coverage & medical emergencies.</div>
                  </div>
                </div>
                <div className="bp-addon-right">
                  <div className="bp-addon-price">+{formatPrice(29 * passengersCount)}</div>
                  <span className={`bp-addon-badge ${addons.travelInsurance ? 'added' : 'opt'}`}>
                    {addons.travelInsurance ? 'Added' : 'Optional'}
                  </span>
                </div>
              </div>

              <div
                className={`bp-addon-card ${addons.priorityBoarding ? 'selected' : ''}`}
                onClick={() => setAddons({ ...addons, priorityBoarding: !addons.priorityBoarding })}
              >
                <div className="bp-addon-left">
                  <div className="bp-addon-icon"><Sparkles size={20} /></div>
                  <div>
                    <div className="bp-addon-title">Priority Boarding & Fast-Track Security</div>
                    <div className="bp-addon-desc">Skip queues and board first.</div>
                  </div>
                </div>
                <div className="bp-addon-right">
                  <div className="bp-addon-price">+{formatPrice(19 * passengersCount)}</div>
                  <span className={`bp-addon-badge ${addons.priorityBoarding ? 'added' : 'opt'}`}>
                    {addons.priorityBoarding ? 'Added' : 'Optional'}
                  </span>
                </div>
              </div>

              <div className="bp-addon-card" style={{ cursor: 'default' }}>
                <div className="bp-addon-left">
                  <div className="bp-addon-icon"><Luggage size={20} /></div>
                  <div>
                    <div className="bp-addon-title">Additional Checked Luggage (+23kg)</div>
                    <div className="bp-addon-desc">Save 40% vs airport check-in desk rates.</div>
                  </div>
                </div>
                <div className="bp-addon-right">
                  <div className="bp-baggage-ctrl">
                    <button className="bp-qty-btn" onClick={() => setAddons({ ...addons, extraBaggage: Math.max(0, addons.extraBaggage - 1) })}>-</button>
                    <span className="bp-qty-val">{addons.extraBaggage}</span>
                    <button className="bp-qty-btn" onClick={() => setAddons({ ...addons, extraBaggage: Math.min(3, addons.extraBaggage + 1) })}>+</button>
                    <span className="bp-addon-price" style={{ marginLeft: 10 }}>+{formatPrice(addons.extraBaggage * 45)}</span>
                  </div>
                </div>
              </div>

              <div className="bp-nav-actions">
                <button type="button" className="bp-btn secondary" onClick={() => setStep(1)}>
                  <ArrowLeft size={18} /> Back
                </button>
                <button type="button" className="bp-btn primary" onClick={() => setStep(3)}>
                  Proceed to Payment <ArrowRight size={18} />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3 */}
          {step === 3 && (
            <div className="bp-card">
              <div className="bp-card-title">
                <div className="bp-card-title-icon"><CreditCard size={18} /></div>
                Order Summary & Payment
              </div>

              <div className="bp-summary-box">
                <div className="bp-summary-row">
                  <span>Base Fare ({passengersCount} × {formatPrice(basePricePerPerson)})</span>
                  <span className="bp-summary-val">{formatPrice(subtotal)}</span>
                </div>
                {seatExtrasCost > 0 && (
                  <div className="bp-summary-row">
                    <span>Seat Selection & Extra Legroom</span>
                    <span className="bp-summary-val">+{formatPrice(seatExtrasCost)}</span>
                  </div>
                )}
                {insurancePrice > 0 && (
                  <div className="bp-summary-row">
                    <span>Travel Protection</span>
                    <span className="bp-summary-val">+{formatPrice(insurancePrice)}</span>
                  </div>
                )}
                {priorityPrice > 0 && (
                  <div className="bp-summary-row">
                    <span>Priority Boarding</span>
                    <span className="bp-summary-val">+{formatPrice(priorityPrice)}</span>
                  </div>
                )}
                {baggagePrice > 0 && (
                  <div className="bp-summary-row">
                    <span>Extra Baggage ({addons.extraBaggage} × 23kg)</span>
                    <span className="bp-summary-val">+{formatPrice(baggagePrice)}</span>
                  </div>
                )}
                <div className="bp-summary-row">
                  <span>Taxes & Fees</span>
                  <span className="bp-summary-val">+{formatPrice(taxesAndFees)}</span>
                </div>
                {promoDiscount > 0 && (
                  <div className="bp-summary-row" style={{ color: '#16a34a' }}>
                    <span>Promo Discount</span>
                    <span className="bp-summary-val">-{formatPrice(promoDiscount)}</span>
                  </div>
                )}
                <div className="bp-summary-row total">
                  <span>Total Amount Due</span>
                  <span>{formatPrice(finalTotal)}</span>
                </div>
              </div>

              <div className="bp-promo-row">
                <input
                  type="text"
                  placeholder="Promo code (FLY2026)"
                  className="bp-input"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value)}
                  style={{ textTransform: 'uppercase' }}
                />
                <button type="button" className="bp-btn secondary" onClick={handleApplyPromo}>Apply</button>
              </div>
              {promoSuccess && <div className="bp-promo-msg success">✓ {promoSuccess}</div>}
              {promoError && <div className="bp-promo-msg error">{promoError}</div>}

              <div className="bp-payment-card">
                <div className="bp-payment-header">
                  <CreditCard size={18} color="#2563eb" /> Secure Credit Card Payment
                  <div className="bp-ssl-badge"><Lock size={12} /> SSL Encrypted</div>
                </div>
                <div className="bp-form-grid">
                  <div className="bp-form-group" style={{ gridColumn: 'span 2' }}>
                    <label>Cardholder Name</label>
                    <input type="text" className="bp-input" value={cardHolder} onChange={(e) => setCardHolder(e.target.value)} />
                  </div>
                  <div className="bp-form-group" style={{ gridColumn: 'span 2' }}>
                    <label>Card Number</label>
                    <input type="text" className="bp-input" value={cardNumber} onChange={(e) => setCardNumber(e.target.value)} />
                  </div>
                  <div className="bp-form-group">
                    <label>Expiry</label>
                    <input type="text" className="bp-input" value={cardExpiry} onChange={(e) => setCardExpiry(e.target.value)} />
                  </div>
                  <div className="bp-form-group">
                    <label>CVV</label>
                    <input type="password" maxLength="4" className="bp-input" value={cardCvv} onChange={(e) => setCardCvv(e.target.value)} />
                  </div>
                </div>
              </div>

              <div className="bp-nav-actions right">
                <button type="button" className="bp-btn secondary" onClick={() => setStep(2)}>
                  <ArrowLeft size={18} /> Back
                </button>
                <button type="button" className="bp-btn pay" onClick={handlePayAndConfirm} disabled={loading}>
                  {loading ? 'Processing...' : `Pay ${formatPrice(finalTotal)} Now`}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* RIGHT SIDEBAR */}
        <aside className="bp-sidebar">
          <div className="bp-sidebar-card">
            <div className="bp-sidebar-title">Flight Summary</div>
            <div className="bp-sb-route">
              <div>
                <div className="bp-sb-iata">{flight.from}</div>
                <div className="bp-sb-city">{flight.fromCity}</div>
              </div>
              <div className="bp-sb-path">
                <div className="bp-sb-dur">{flight.duration}</div>
                <div className="bp-sb-line" />
              </div>
              <div style={{ textAlign: 'right' }}>
                <div className="bp-sb-iata">{flight.to}</div>
                <div className="bp-sb-city">{flight.toCity}</div>
              </div>
            </div>
            <div className="bp-sb-info-grid">
              <div>
                <div className="bp-sb-label">Flight</div>
                <div className="bp-sb-val">{flight.flightNumber}</div>
              </div>
              <div>
                <div className="bp-sb-label">Cabin</div>
                <div className="bp-sb-val" style={{ textTransform: 'capitalize' }}>{cabinClass}</div>
              </div>
              <div>
                <div className="bp-sb-label">Depart</div>
                <div className="bp-sb-val">{flight.departureTime}</div>
              </div>
              <div>
                <div className="bp-sb-label">Arrive</div>
                <div className="bp-sb-val">{flight.arrivalTime}</div>
              </div>
            </div>
          </div>

          <div className="bp-sidebar-card">
            <div className="bp-sidebar-title">Price Breakdown</div>
            <div className="bp-sb-price-row">
              <span>Base Fare (×{passengersCount})</span>
              <span className="bp-sb-price-val">{formatPrice(subtotal)}</span>
            </div>
            <div className="bp-sb-price-row total">
              <span>Total</span>
              <span className="bp-sb-price-val big">{formatPrice(finalTotal)}</span>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default BookingPage;
