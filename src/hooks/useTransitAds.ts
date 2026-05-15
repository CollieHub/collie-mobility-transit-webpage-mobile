import { useState, useEffect } from 'react';

export interface TransitAd {
  id: string;
  imageUrl?: string;
  redirectUrl?: string;
  title?: string;
  subtitle?: string;
  color?: string;
  border?: string;
  text?: string;
}

export function useTransitAds() {
  const [ads, setAds] = useState<TransitAd[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function fetchAds() {
      try {
        const baseUrl = import.meta.env.VITE_TRANSIT_API_URL || '';
        const res = await fetch(`${baseUrl}/transit/ads`);
        if (!res.ok) throw new Error('Failed to fetch ads');
        const data = await res.json();
        if (isMounted) {
          setAds(data);
          setIsLoading(false);
        }
      } catch (err) {
        console.warn('Failed to load ads from backend, using fallbacks', err);
        if (isMounted) setIsLoading(false);
      }
    }
    fetchAds();
    return () => { isMounted = false; };
  }, []);

  return { ads, isLoading };
}
