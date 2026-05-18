import { useState, useEffect } from 'react';

export interface GeoData {
  country_name: string;
  country_code: string;
  region: string;
  city: string;
  postal: string;
  currency: string;
  languages: string;
}

export function useGeoLocation() {
  const [geoData, setGeoData] = useState<GeoData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchGeo() {
      try {
        const response = await fetch('https://ipapi.co/json/');
        const data = await response.json();
        
        if (data.error) {
          throw new Error(data.reason || 'Failed to detect location');
        }

        setGeoData({
          country_name: data.country_name,
          country_code: data.country_code,
          region: data.region,
          city: data.city,
          postal: data.postal,
          currency: data.currency,
          languages: data.languages
        });
      } catch (err: any) {
        console.error('Geo-location error:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchGeo();
  }, []);

  return { geoData, loading, error };
}
