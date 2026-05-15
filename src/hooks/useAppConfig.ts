import { useState, useEffect } from 'react';

export interface AppConfig {
  banner_top_enabled: boolean;
  banner_menu_enabled: boolean;
  publicite_enabled: boolean;
  publicite_url?: string;
  banners_enabled: boolean;
  privacy_terms_enabled: boolean;
  privacy_terms_text: string;
  realtime_transit_enabled: boolean;
  important_places_enabled: boolean;
  enabled_routes: string[];
}

const DEFAULT_CONFIG: AppConfig = {
  banner_top_enabled: false,
  banner_menu_enabled: false,
  publicite_enabled: false,
  publicite_url: '',
  banners_enabled: true, // Por defecto true para no romper compatibilidad local sin server
  privacy_terms_enabled: true,
  privacy_terms_text: '',
  realtime_transit_enabled: true,
  important_places_enabled: false,
  enabled_routes: [] // Si está vacío, asumimos que todas están habilitadas
};

export function useAppConfig() {
  const [config, setConfig] = useState<AppConfig>(DEFAULT_CONFIG);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function fetchConfig() {
      try {
        const baseUrl = import.meta.env.VITE_TRANSIT_API_URL || '';
        const res = await fetch(`${baseUrl}/transit/config`, {
          headers: {
            'Content-Type': 'application/json',
            'X-Application-ID': 'COLLIE-HEALTH-WEB'
          }
        });

        if (!res.ok) {
          throw new Error(`Failed to fetch config: ${res.status}`);
        }

        const data = await res.json();
        
        if (isMounted) {
          setConfig(data);
          setIsLoading(false);
        }
      } catch (err: any) {
        console.warn('Config fetch failed, using defaults:', err.message);
        if (isMounted) {
          setError(err);
          setIsLoading(false);
        }
      }
    }

    fetchConfig();

    return () => {
      isMounted = false;
    };
  }, []);

  return { config, isLoading, error };
}
