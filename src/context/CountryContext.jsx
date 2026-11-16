import { createContext, useContext, useState } from 'react';
import {
  BASE_GBP_PRICE,
  CURRENCY_PRICES,
  COUNTRIES,
  getUnitPriceForCountry,
  formatCurrencyAmount,
} from '../utils/currency';

const CountryContext = createContext(null);

export function CountryProvider({ children }) {
  // Automatically select GBP (Shopify base currency) whenever the user opens the website
  const [selectedCountry, setSelectedCountry] = useState(() => COUNTRIES[0]);

  const setCountry = (countryOrCode) => {
    const target = typeof countryOrCode === 'string'
      ? COUNTRIES.find((c) => c.code === countryOrCode) || COUNTRIES[0]
      : countryOrCode || COUNTRIES[0];
    setSelectedCountry(target);
  };

  const getUnitPrice = (shopifyGbpPrice = BASE_GBP_PRICE) =>
    getUnitPriceForCountry(selectedCountry.code, shopifyGbpPrice);

  const formatPrice = (amount, countryOverride) =>
    formatCurrencyAmount(amount, countryOverride || selectedCountry);

  return (
    <CountryContext.Provider
      value={{
        selectedCountry,
        setCountry,
        countries: COUNTRIES,
        currencyPrices: CURRENCY_PRICES,
        getUnitPrice,
        formatPrice,
      }}
    >
      {children}
    </CountryContext.Provider>
  );
}

export function useCountry() {
  const ctx = useContext(CountryContext);
  if (!ctx) {
    throw new Error('useCountry must be used within a CountryProvider');
  }
  return ctx;
}
