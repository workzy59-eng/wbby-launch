import React, { createContext, useContext, useState, useEffect } from 'react';

export type Country = 'India' | 'United States' | 'United Kingdom';

interface RegionContextType {
  country: Country;
  setCountry: (country: Country) => void;
  currency: string;
  symbol: string;
  gateway: 'Stripe';
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
    gateway: 'Stripe' as const,
    pricing: { basic: '9,999', standard: '19,999', premium: '39,999' },
    paymentLinks: {
      basic: '#',
      standard: '#',
      premium: '#'
    }
  },
  'United States': {
    currency: '$',
    symbol: 'USD',
    gateway: 'Stripe' as const,
    pricing: { basic: '129', standard: '249', premium: '499' },
    paymentLinks: { basic: '#', standard: '#', premium: '#' }
  },
  'United Kingdom': {
    currency: '£',
    symbol: 'GBP',
    gateway: 'Stripe' as const,
    pricing: { basic: '99', standard: '189', premium: '379' },
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
