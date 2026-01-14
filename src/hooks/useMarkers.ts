import { useState, useCallback, useEffect } from 'react';
import { MapMarker, MarkerType, APP_CONFIG } from '@/config/app';
import { filterMarkersByRadius, isExpired } from '@/utils/geo';

// Generate unique ID
function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export function useMarkers(userLat: number | null, userLng: number | null) {
  const [markers, setMarkers] = useState<MapMarker[]>([]);
  const [fadingMarkers, setFadingMarkers] = useState<Set<string>>(new Set());

  // Add new marker
  const addMarker = useCallback((lat: number, lng: number, type: MarkerType) => {
    const newMarker: MapMarker = {
      id: generateId(),
      lat,
      lng,
      type,
      createdAt: Date.now(),
    };
    
    setMarkers((prev) => [...prev, newMarker]);
    
    // In a real app, this would be sent to the server via WebSocket
    console.log('Marker created:', newMarker);
  }, []);

  // Start fade animation for a marker
  const startFadeMarker = useCallback((id: string) => {
    setFadingMarkers((prev) => new Set(prev).add(id));
  }, []);

  // Remove marker after fade
  const removeMarker = useCallback((id: string) => {
    setMarkers((prev) => prev.filter((m) => m.id !== id));
    setFadingMarkers((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  }, []);

  // Check for expired markers
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      
      markers.forEach((marker) => {
        const elapsed = (now - marker.createdAt) / 1000;
        const fadeStart = APP_CONFIG.MARKER_TTL_SECONDS - APP_CONFIG.FADE_OUT_START_BEFORE_SECONDS;
        
        // Start fade animation
        if (elapsed >= fadeStart && !fadingMarkers.has(marker.id)) {
          startFadeMarker(marker.id);
          
          // Remove after fade animation completes
          setTimeout(() => {
            removeMarker(marker.id);
          }, APP_CONFIG.FADE_OUT_DURATION_MS);
        }
        
        // Force remove if somehow still there after TTL
        if (isExpired(marker.createdAt, APP_CONFIG.MARKER_TTL_SECONDS + 2)) {
          removeMarker(marker.id);
        }
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [markers, fadingMarkers, startFadeMarker, removeMarker]);

  // Filter visible markers by radius
  const visibleMarkers = userLat && userLng
    ? filterMarkersByRadius(markers, userLat, userLng, APP_CONFIG.VISIBILITY_RADIUS_KM)
    : markers;

  return {
    markers: visibleMarkers,
    fadingMarkers,
    addMarker,
    removeMarker,
  };
}
