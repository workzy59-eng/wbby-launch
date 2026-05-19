import React, { createContext, useContext, useState, useEffect } from 'react';

export type Country = 'India' | 'United States' | 'United Kingdom';

interface RegionContextType {
  country: Country;
  setCountry: (country: Country) => void;
  currency: string;
  symbol: string;
  gateway: 'Razorpay' | 'Stripe';
  pricing: {
    basic: string;
    standard: string;
    premium: string;
  };
  paymentLinks: {
    basic: string;
    standard: string;
    premium: string;
  };
}

const REGION_DATA = {
  'India': {
    currency: '₹',
    symbol: 'INR',
    gateway: 'Razorpay' as const,
    pricing: { basic: '7,500', standard: '15,000', premium: '30,000' },
    paymentLinks: {
      basic: 'https://rzp.io/rzp/rrnwz9wP',
      standard: 'https://rzp.io/rzp/CfyMMJ1I',
      premium: 'https://rzp.io/rzp/H06QGZK'
    }
  },
  'United States': {
    currency: '$',
    symbol: 'USD',
    gateway: 'Stripe' as const,
    pricing: { basic: '209', standard: '520', premium: '729' },
    paymentLinks: { basic: '#', standard: '#', premium: '#' }
  },
  'United Kingdom': {
    currency: '£',
    symbol: 'GBP',
    gateway: 'Stripe' as const,
    pricing: { basic: '156', standard: '390', premium: '547' },
    paymentLinks: { basic: '#', standard: '#', premium: '#' }
  }
};

const RegionContext = createContext<RegionContextType | undefined>(undefined);

export function RegionProvider({ children }: { children: React.ReactNode }) {
  const [country, setCountryState] = useState<Country>(() => {
    const saved = localStorage.getItem('webbylaunch_region');
    return (saved as Country) || 'India';
  });

  const setCountry = (newCountry: Country) => {
    setCountryState(newCountry);
    localStorage.setItem('webbylaunch_region', newCountry);
  };

  const data = REGION_DATA[country];

  return (
    <RegionContext.Provider value={{ country, setCountry, ...data }}>
      {children}
    </RegionContext.Provider>
  );
}

export function useRegion() {
  const context = useContext(RegionContext);
  if (context === undefined) {
    throw new Error('useRegion must be used within a RegionProvider');
  }
  return context;
}
