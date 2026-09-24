import React, { useState } from 'react';
import {
  X,
  Shield,
  Luggage,
  Sparkles,
  CreditCard,
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  Ticket,
  Lock
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useCurrency } from '../context/CurrencyContext';
import '../styles/booking.css';

const BookingModal = ({
  isOpen,
  flight,
  cabinClass = 'economy',
  selectedSeats = [],
  seatExtrasCost = 0,
  departureDate,
  onClose,
  onBookingSuccess,
  onViewBoardingPass
}) => {
  const { user } = useAuth();
  const { formatPrice, currency } = useCurrency();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [confirmedBooking, setConfirmedBooking] = useState(null);

  // Passengers details
  const passengersCount = Math.max(1, selectedSeats.length || 1);
  const [passengers, setPassengers] = useState(() =>
    Array.from({ length: passengersCount }, (_, idx) => ({
      firstName: idx === 0 && user?.name ? user.name.split(' ')[0] : '',
      lastName: idx === 0 && user?.name ? user.name.split(' ')[1] || '' : '',
      age: 28,
      gender: 'Male',
      passport: '',
      meal: 'Standard Meal',
      seat: selectedSeats[idx]?.code || `12${String.fromCharCode(65 + idx)}`
    }))
  );

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

  if (!isOpen || !flight) return null;

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
        departureDate,
        passengers,
        contact,
        addons,
        totalAmount: finalTotal,
        currency,
        paymentMethod: 'Credit Card (ending 4242)'
      };

      const result = await api.createBooking(bookingPayload);
      setConfirmedBooking(result.booking);
      setStep(4);

      // Trigger Celebration Confetti!
      try {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch (_e) {
        // Confetti fallback
      }


      if (onBookingSuccess) {
        onBookingSuccess(result.booking);
      }
    } catch (err) {
      alert(err.message || 'Payment processing failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card booking-modal-card" onClick={(e) => e.stopPropagation()}>
        {/* Header with Stepper */}
        <div className="booking-modal-header">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <span className="badge badge-primary">Flight Reservation</span>
              <h2 style={{ fontSize: '1.45rem', marginTop: 4 }}>
                {flight.fromCity} ({flight.from}) → {flight.toCity} ({flight.to})
              </h2>
            </div>
            <button className="modal-close-btn" onClick={onClose} aria-label="Close">
              <X size={18} />
            </button>
          </div>

          {step < 4 && (
            <div className="checkout-stepper">
              <div className={`checkout-step-item ${step === 1 ? 'active' : step > 1 ? 'completed' : ''}`}>
                <div className="step-num-badge">1</div>
                <span>Passengers</span>
              </div>
              <div className={`checkout-step-item ${step === 2 ? 'active' : step > 2 ? 'completed' : ''}`}>
                <div className="step-num-badge">2</div>
                <span>Add-ons</span>
              </div>
              <div className={`checkout-step-item ${step === 3 ? 'active' : step > 3 ? 'completed' : ''}`}>
                <div className="step-num-badge">3</div>
                <span>Payment</span>
              </div>
            </div>
          )}
        </div>

        {/* Modal Body: Dynamic Step Content */}
        <div className="booking-modal-body">
          {/* STEP 1: PASSENGERS */}
          {step === 1 && (
            <div>
              <h3 style={{ fontSize: '1.15rem', marginBottom: 16 }}>Passenger Information</h3>
              {passengers.map((p, idx) => (
                <div key={idx} className="passenger-input-card">
                  <div className="passenger-card-header">
                    <span>Passenger {idx + 1} (Adult)</span>
                    <span className="badge badge-primary">Seat: {p.seat}</span>
                  </div>

                  <div className="passenger-form-grid">
                    <div className="form-group">
                      <label>First / Given Name</label>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="e.g. John"
                        value={p.firstName}
                        onChange={(e) => updatePassenger(idx, 'firstName', e.target.value)}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label>Last / Surname</label>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="e.g. Doe"
                        value={p.lastName}
                        onChange={(e) => updatePassenger(idx, 'lastName', e.target.value)}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label>Gender</label>
                      <select
                        className="form-input"
                        value={p.gender}
                        onChange={(e) => updatePassenger(idx, 'gender', e.target.value)}
                      >
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other / Undisclosed</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label>Age</label>
                      <input
                        type="number"
                        min="1"
                        max="120"
                        className="form-input"
                        value={p.age}
                        onChange={(e) => updatePassenger(idx, 'age', parseInt(e.target.value, 10))}
                      />
                    </div>

                    <div className="form-group">
                      <label>Passport / National ID</label>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="e.g. A12345678"
                        value={p.passport}
                        onChange={(e) => updatePassenger(idx, 'passport', e.target.value)}
                      />
                    </div>

                    <div className="form-group">
                      <label>Meal Preference</label>
                      <select
                        className="form-input"
                        value={p.meal}
                        onChange={(e) => updatePassenger(idx, 'meal', e.target.value)}
                      >
                        <option value="Standard Meal">Standard Airline Meal</option>
                        <option value="Asian Vegetarian">Asian Vegetarian</option>
                        <option value="Vegan">Strict Vegan</option>
                        <option value="Halal">Halal Certified</option>
                        <option value="Kosher">Kosher</option>
                        <option value="Chef Special">First / Business Chef Special</option>
                      </select>
                    </div>
                  </div>
                </div>
              ))}

              <h4 style={{ fontSize: '1rem', marginTop: 24, marginBottom: 12 }}>Booking Contact</h4>
              <div className="passenger-form-grid" style={{ marginBottom: 20 }}>
                <div className="form-group">
                  <label>Contact Email (For E-Ticket & Updates)</label>
                  <input
                    type="email"
                    className="form-input"
                    placeholder="email@example.com"
                    value={contact.email}
                    onChange={(e) => setContact({ ...contact, email: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Mobile Phone</label>
                  <input
                    type="tel"
                    className="form-input"
                    placeholder="+1 (555) 000-0000"
                    value={contact.phone}
                    onChange={(e) => setContact({ ...contact, phone: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 20 }}>
                <button
                  type="button"
                  className="btn-primary"
                  onClick={() => setStep(2)}
                >
                  Continue to Add-ons
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: ADD-ONS & EXTRAS */}
          {step === 2 && (
            <div>
              <h3 style={{ fontSize: '1.15rem', marginBottom: 8 }}>Enhance Your Journey</h3>
              <p style={{ fontSize: '0.88rem', color: '#64748b', marginBottom: 20 }}>
                Select optional travel protections and convenience perks.
              </p>

              {/* Insurance */}
              <div
                className={`addon-card ${addons.travelInsurance ? 'selected' : ''}`}
                onClick={() => setAddons({ ...addons, travelInsurance: !addons.travelInsurance })}
              >
                <div className="addon-info">
                  <div className="addon-icon">
                    <Shield size={22} />
                  </div>
                  <div>
                    <div className="addon-title">Comprehensive Travel & Medical Insurance</div>
                    <div className="addon-desc">
                      100% trip cancellation coverage, medical emergencies up to $100k, and baggage delay compensation.
                    </div>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontWeight: 700, color: '#2563eb' }}>
                    +{formatPrice(29 * passengersCount)}
                  </div>
                  <span className="badge badge-primary">{addons.travelInsurance ? 'Added' : 'Optional'}</span>
                </div>
              </div>

              {/* Priority Boarding */}
              <div
                className={`addon-card ${addons.priorityBoarding ? 'selected' : ''}`}
                onClick={() => setAddons({ ...addons, priorityBoarding: !addons.priorityBoarding })}
              >
                <div className="addon-info">
                  <div className="addon-icon">
                    <Sparkles size={22} />
                  </div>
                  <div>
                    <div className="addon-title">Priority Boarding & Fast-Track Security</div>
                    <div className="addon-desc">
                      Skip security queues, be the first to board, and secure dedicated overhead bin space.
                    </div>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontWeight: 700, color: '#2563eb' }}>
                    +{formatPrice(19 * passengersCount)}
                  </div>
                  <span className="badge badge-primary">{addons.priorityBoarding ? 'Added' : 'Optional'}</span>
                </div>
              </div>

              {/* Extra Baggage */}
              <div className="addon-card" onClick={(e) => e.stopPropagation()}>
                <div className="addon-info">
                  <div className="addon-icon">
                    <Luggage size={22} />
                  </div>
                  <div>
                    <div className="addon-title">Additional Checked Luggage (+23kg piece)</div>
                    <div className="addon-desc">Save up to 40% compared to airport check-in desk rates.</div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <button
                    type="button"
                    className="btn-secondary"
                    style={{ padding: '6px 12px' }}
                    onClick={() =>
                      setAddons({ ...addons, extraBaggage: Math.max(0, addons.extraBaggage - 1) })
                    }
                  >
                    -
                  </button>
                  <span style={{ fontWeight: 700, minWidth: 20, textAlign: 'center' }}>
                    {addons.extraBaggage}
                  </span>
                  <button
                    type="button"
                    className="btn-secondary"
                    style={{ padding: '6px 12px' }}
                    onClick={() =>
                      setAddons({ ...addons, extraBaggage: Math.min(3, addons.extraBaggage + 1) })
                    }
                  >
                    +
                  </button>
                  <span style={{ fontWeight: 700, color: '#2563eb', marginLeft: 8 }}>
                    +{formatPrice(addons.extraBaggage * 45)}
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 24 }}>
                <button type="button" className="btn-secondary" onClick={() => setStep(1)}>
                  <ArrowLeft size={16} />
                  Back
                </button>
                <button type="button" className="btn-primary" onClick={() => setStep(3)}>
                  Proceed to Payment
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: PAYMENT & SUMMARY */}
          {step === 3 && (
            <div>
              <h3 style={{ fontSize: '1.15rem', marginBottom: 16 }}>Order Summary & Payment</h3>

              {/* Price breakdown */}
              <div className="checkout-summary-box">
                <div className="summary-row">
                  <span>
                    Base Fare ({passengersCount} × {formatPrice(basePricePerPerson)})
                  </span>
                  <span>{formatPrice(subtotal)}</span>
                </div>

                {seatExtrasCost > 0 && (
                  <div className="summary-row">
                    <span>Seat Selection & Extra Legroom Fees</span>
                    <span>+{formatPrice(seatExtrasCost)}</span>
                  </div>
                )}

                {insurancePrice > 0 && (
                  <div className="summary-row">
                    <span>Travel & Medical Protection</span>
                    <span>+{formatPrice(insurancePrice)}</span>
                  </div>
                )}

                {priorityPrice > 0 && (
                  <div className="summary-row">
                    <span>Priority Boarding & Security</span>
                    <span>+{formatPrice(priorityPrice)}</span>
                  </div>
                )}

                {baggagePrice > 0 && (
                  <div className="summary-row">
                    <span>Extra Baggage ({addons.extraBaggage} × 23kg)</span>
                    <span>+{formatPrice(baggagePrice)}</span>
                  </div>
                )}

                <div className="summary-row">
                  <span>Taxes, Regulatory Surcharges & Airport Fees</span>
                  <span>+{formatPrice(taxesAndFees)}</span>
                </div>

                {promoDiscount > 0 && (
                  <div className="summary-row" style={{ color: '#16a34a', fontWeight: 700 }}>
                    <span>Promo Code Discount</span>
                    <span>-{formatPrice(promoDiscount)}</span>
                  </div>
                )}

                <div className="summary-row total">
                  <span>Total Amount Due</span>
                  <span>{formatPrice(finalTotal)}</span>
                </div>
              </div>

              {/* Promo code bar */}
              <div className="promo-input-group">
                <input
                  type="text"
                  placeholder="Enter promo code (e.g. FLY2026)"
                  className="form-input"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value)}
                  style={{ textTransform: 'uppercase' }}
                />
                <button type="button" className="btn-secondary" onClick={handleApplyPromo}>
                  Apply
                </button>
              </div>
              {promoSuccess && (
                <div style={{ color: '#16a34a', fontSize: '0.85rem', marginBottom: 16 }}>
                  ✓ {promoSuccess}
                </div>
              )}
              {promoError && (
                <div style={{ color: '#be123c', fontSize: '0.85rem', marginBottom: 16 }}>
                  {promoError}
                </div>
              )}

              {/* Payment Details Form */}
              <div className="passenger-input-card" style={{ background: '#fff' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                  <CreditCard size={18} color="#2563eb" />
                  <span style={{ fontWeight: 700 }}>Instant Secure Payment</span>
                  <span style={{ marginLeft: 'auto', fontSize: '0.78rem', color: '#10b981', display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Lock size={12} /> 256-bit SSL Encrypted
                  </span>
                </div>

                <div className="passenger-form-grid">
                  <div className="form-group" style={{ gridColumn: 'span 2' }}>
                    <label>Cardholder Name</label>
                    <input
                      type="text"
                      className="form-input"
                      value={cardHolder}
                      onChange={(e) => setCardHolder(e.target.value)}
                    />
                  </div>

                  <div className="form-group" style={{ gridColumn: 'span 2' }}>
                    <label>Card Number</label>
                    <input
                      type="text"
                      className="form-input"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label>Expiry Date</label>
                    <input
                      type="text"
                      className="form-input"
                      value={cardExpiry}
                      onChange={(e) => setCardExpiry(e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label>CVV / CVC</label>
                    <input
                      type="password"
                      maxLength="4"
                      className="form-input"
                      value={cardCvv}
                      onChange={(e) => setCardCvv(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 24 }}>
                <button type="button" className="btn-secondary" onClick={() => setStep(2)}>
                  <ArrowLeft size={16} />
                  Back
                </button>
                <button
                  type="button"
                  className="btn-accent"
                  onClick={handlePayAndConfirm}
                  disabled={loading}
                  style={{ minWidth: 200 }}
                >
                  {loading ? 'Processing Payment...' : `Pay ${formatPrice(finalTotal)} Now`}
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: CONFIRMATION & SUCCESS */}
          {step === 4 && confirmedBooking && (
            <div className="booking-success-view">
              <div className="success-icon-bubble">
                <CheckCircle size={44} />
              </div>
              <h2 style={{ fontSize: '1.75rem', marginBottom: 6 }}>Booking Confirmed!</h2>
              <p style={{ color: '#64748b', fontSize: '0.95rem' }}>
                Your flight with {confirmedBooking.airline} is booked and ticketed.
                A confirmation receipt has been sent to {confirmedBooking.contact?.email}.
              </p>

              <div className="pnr-box">
                <div style={{ fontSize: '0.8rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                  Booking Reference / PNR
                </div>
                <div className="pnr-code">{confirmedBooking.pnr}</div>
                <div style={{ fontSize: '0.85rem', color: '#16a34a', fontWeight: 600 }}>
                  Status: CONFIRMED
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'center', gap: 14, marginTop: 10 }}>
                <button
                  type="button"
                  className="btn-primary"
                  onClick={() => onViewBoardingPass(confirmedBooking)}
                >
                  <Ticket size={18} />
                  View Boarding Pass / E-Ticket
                </button>
                <button type="button" className="btn-secondary" onClick={onClose}>
                  Done
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookingModal;
