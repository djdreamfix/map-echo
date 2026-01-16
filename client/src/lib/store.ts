import { useState, useEffect } from 'react';
import { getDistance } from 'geolib';

export type MarkerType = 'blue' | 'green' | 'split';

export interface Marker {
  id: string;
  lat: number;
  lng: number;
  type: MarkerType;
  createdAt: number;
  expiresAt: number;
}

const STORAGE_KEY = 'geo_markers_v1';
const TTL_MS = 30 * 60 * 1000; // 30 minutes
const VISIBILITY_RADIUS_METERS = 5000; // 5km

export function useMarkerStore() {
  const [markers, setMarkers] = useState<Marker[]>([]);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);

  // Load markers from storage and setup listener
  useEffect(() => {
    const load = () => {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored) as Marker[];
          const now = Date.now();
          const valid = parsed.filter(m => m.expiresAt > now);
          setMarkers(valid);
        }
      } catch (e) {
        console.error('Failed to load markers', e);
      }
    };

    load();

    // Poll for expiration every second
    const interval = setInterval(() => {
      setMarkers(prev => {
        const now = Date.now();
        const next = prev.filter(m => m.expiresAt > now);
        if (next.length !== prev.length) {
          // If we filtered something out, update storage too to keep it clean
          localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
          return next;
        }
        return prev;
      });
      
      // Also reload from storage to simulate "realtime" updates from other tabs
      load(); 
    }, 1000);

    // Listen for cross-tab updates
    const handleStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) load();
    };
    window.addEventListener('storage', handleStorage);

    return () => {
      clearInterval(interval);
      window.removeEventListener('storage', handleStorage);
    };
  }, []);

  // Track user location
  useEffect(() => {
    if (!navigator.geolocation) return;
    
    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        setUserLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude
        });
      },
      (err) => console.error(err),
      { enableHighAccuracy: true }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  const addMarker = (lat: number, lng: number, type: MarkerType) => {
    const now = Date.now();
    const newMarker: Marker = {
      id: Math.random().toString(36).substr(2, 9),
      lat,
      lng,
      type,
      createdAt: now,
      expiresAt: now + TTL_MS
    };

    const updated = [...markers, newMarker];
    setMarkers(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    
    // Dispatch event for current tab immediate update if needed elsewhere
    window.dispatchEvent(new Event('storage'));
  };

  const visibleMarkers = userLocation 
    ? markers.filter(m => getDistance(userLocation, { lat: m.lat, lng: m.lng }) <= VISIBILITY_RADIUS_METERS)
    : markers;

  return {
    markers: visibleMarkers, // Only return filtered ones
    allMarkers: markers,
    addMarker,
    userLocation
  };
}
