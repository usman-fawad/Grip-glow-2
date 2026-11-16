export const BASE_GBP_PRICE = 39.99;

export const CURRENCY_PRICES = {
  GBP: 39.99,
  AUD: 77.99,
  USD: 53.99,
  EUR: 47.99,
  NZD: 95.99,
  CAD: 75.99,
};

export const COUNTRIES = [
  { code: 'GBP', name: 'United Kingdom', flag: 'gb', symbol: '£', label: '🇬🇧 GBP — British Pound',     deliveryText: 'FREE DELIVERY' },
  { code: 'AUD', name: 'Australia',      flag: 'au', symbol: '$', label: '🇦🇺 AUD — Australian Dollar', deliveryText: 'FAST TRACKED SHIPPING' },
  { code: 'USD', name: 'United States',  flag: 'us', symbol: '$', label: '🇺🇸 USD — US Dollar',          deliveryText: 'FREE SHIPPING' },
  { code: 'EUR', name: 'Europe',         flag: 'eu', symbol: '€', label: '🇪🇺 EUR — Euro',              deliveryText: 'FAST TRACKED DELIVERY' },
  { code: 'NZD', name: 'New Zealand',    flag: 'nz', symbol: '$', label: '🇳🇿 NZD — New Zealand Dollar', deliveryText: 'FAST TRACKED SHIPPING' },
  { code: 'CAD', name: 'Canada',         flag: 'ca', symbol: '$', label: '🇨🇦 CAD — Canadian Dollar',    deliveryText: 'FAST TRACKED SHIPPING' },
];

export function getUnitPriceForCountry(countryCode, shopifyGbpPrice = BASE_GBP_PRICE) {
  const code = countryCode || 'GBP';
  const liveGbp = Number.isFinite(Number(shopifyGbpPrice)) && Number(shopifyGbpPrice) > 0
    ? Number(shopifyGbpPrice)
    : BASE_GBP_PRICE;

  if (code === 'GBP') {
    return +liveGbp.toFixed(2);
  }

  const targetFixed = CURRENCY_PRICES[code] ?? CURRENCY_PRICES.GBP;
  if (Math.abs(liveGbp - BASE_GBP_PRICE) < 0.01) {
    return targetFixed;
  }

  return +(targetFixed * (liveGbp / BASE_GBP_PRICE)).toFixed(2);
}

export function formatCurrencyAmount(amount, countryOrCode = 'GBP') {
  const country = typeof countryOrCode === 'string'
    ? COUNTRIES.find((c) => c.code === countryOrCode) || COUNTRIES[0]
    : countryOrCode || COUNTRIES[0];
  const numeric = Number(amount) || 0;
  return `${country.symbol}${numeric.toFixed(2)} ${country.code}`;
}

