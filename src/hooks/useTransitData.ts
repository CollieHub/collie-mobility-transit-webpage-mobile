import { useState, useEffect } from 'react';
import { decryptData } from '../lib/geo-crypto/crypto';
import { cacheGet, cacheSet } from '../lib/cache/indexedDB';
import { TransitAPIClient } from '../lib/api/transitClient';

export interface TransitDataPayload {
    version: string;
    routes: any[];
    stops: any[];
}

// API base URL - will be configured per environment
const API_BASE_URL = import.meta.env.VITE_TRANSIT_API_URL || '';

// Data source mode:
// 'api'    → Use backend API with handshake + session keys (production)
// 'static' → Use static encrypted JSON from /public/data/ (development/LAN)
const DATA_MODE = (import.meta.env.VITE_TRANSIT_DATA_MODE || 'static') as 'api' | 'static';

const CACHE_KEY_DATA = 'transit-data-payload';
const CACHE_KEY_HASH = 'transit-data-hash';

// Singleton API client
let apiClient: TransitAPIClient | null = null;
function getAPIClient(): TransitAPIClient {
    if (!apiClient) {
        apiClient = new TransitAPIClient(API_BASE_URL);
    }
    return apiClient;
}

export function useTransitData() {
    const [data, setData] = useState<TransitDataPayload | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);
    const [dataSource, setDataSource] = useState<'cache' | 'network' | 'static'>('network');

    useEffect(() => {
        let isMounted = true;

        async function loadViaAPI() {
            const client = getAPIClient();
            
            // 1. Check cache first (instant)
            const cachedData = await cacheGet<TransitDataPayload>(CACHE_KEY_DATA);
            const cachedHash = await cacheGet<string>(CACHE_KEY_HASH);

            if (cachedData && isMounted) {
                setData(cachedData);
                setIsLoading(false);
                setDataSource('cache');
            }

            try {
                // 2. Check if server has newer data
                const syncInfo = await client.sync(cachedHash || undefined);
                
                if (syncInfo === null) {
                    // 304 - data hasn't changed, cache is valid
                    if (!cachedData) throw new Error('No cache and server returned 304');
                    return;
                }

                // 3. New data available → handshake + download
                const freshData = await client.getData();
                
                if (isMounted) {
                    setData(freshData);
                    setDataSource('network');
                    setIsLoading(false);
                }

                // 4. Save to cache for offline use
                await cacheSet(CACHE_KEY_DATA, freshData);
                await cacheSet(CACHE_KEY_HASH, syncInfo.hash);

            } catch (networkErr: any) {
                console.warn('Network fetch failed, using cache:', networkErr.message);
                // If we already have cache, we're fine
                if (cachedData && isMounted) {
                    setDataSource('cache');
                    return;
                }
                // No cache and no network → real error
                if (isMounted) {
                    setError(networkErr);
                    setIsLoading(false);
                }
            }
        }

        async function loadViaStatic() {
            // 1. Check cache first (instant)
            const cachedData = await cacheGet<TransitDataPayload>(CACHE_KEY_DATA);
            const cachedHash = await cacheGet<string>(CACHE_KEY_HASH);

            if (cachedData && isMounted) {
                setData(cachedData);
                setIsLoading(false);
                setDataSource('cache');
            }

            try {
                // 2. Fetch static encrypted JSON
                const response = await fetch('/data/transit-data.json');
                if (!response.ok) throw new Error('Failed to fetch transit data');
                const json = await response.json();
                
                // 3. Check if hash changed (avoid re-decrypt)
                if (json.hash === cachedHash && cachedData) {
                    return; // Already showing cached data
                }

                // 4. Decrypt
                const decryptedData = await decryptData(json.data);
                
                if (isMounted) {
                    setData(decryptedData);
                    setDataSource('network');
                    setIsLoading(false);
                }

                // 5. Cache for offline
                await cacheSet(CACHE_KEY_DATA, decryptedData);
                await cacheSet(CACHE_KEY_HASH, json.hash);

            } catch (err: any) {
                console.warn('Static fetch failed:', err.message);
                if (cachedData && isMounted) return;
                if (isMounted) {
                    setError(err);
                    setIsLoading(false);
                }
            }
        }

        if (DATA_MODE === 'api') {
            loadViaAPI();
        } else {
            loadViaStatic();
        }

        return () => { isMounted = false; };
    }, []);

    return { data, isLoading, error, dataSource };
}
