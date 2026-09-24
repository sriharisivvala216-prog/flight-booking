/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState } from 'react';


const CurrencyContext = createContext(null);

const RATES = {
  USD: { rate: 1, symbol: '$', code: 'USD' },
  EUR: { rate: 0.92, symbol: '€', code: 'EUR' },
  GBP: { rate: 0.79, symbol: '£', code: 'GBP' },
  INR: { rate: 83.5, symbol: '₹', code: 'INR' }
};

export const CurrencyProvider = ({ children }) => {
  const [currency, setCurrency] = useState('USD');

  const formatPrice = (amountInUSD) => {
    if (typeof amountInUSD !== 'number') return `${RATES[currency].symbol}0`;
    const converted = amountInUSD * RATES[currency].rate;
    const rounded = Math.round(converted);
    return `${RATES[currency].symbol}${rounded.toLocaleString()}`;
  };

  return (
    <CurrencyContext.Provider
      value={{
        currency,
        setCurrency,
        formatPrice,
        currencies: Object.keys(RATES),
        currentMeta: RATES[currency]
      }}
    >
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = () => {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
};
