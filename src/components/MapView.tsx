import { useEffect, useRef, useState, useCallback } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { createRoot } from 'react-dom/client';
import { APP_CONFIG, MarkerType } from '@/config/app';
import { MarkerIcon } from './MarkerIcon';
import { MarkerTypeSelector } from './MarkerTypeSelector';
import { useGeolocation } from '@/hooks/useGeolocation';
import { useMarkers } from '@/hooks/useMarkers';
import { useTheme } from '@/hooks/useTheme';
import { Navigation, Loader2 } from 'lucide-react';

export function MapView() {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  
  const { latitude, longitude, loading, error, requestLocation } = useGeolocation();
  const { markers, fadingMarkers, addMarker } = useMarkers(latitude, longitude);
  const { isDark } = useTheme();
  
  const [pendingClick, setPendingClick] = useState<{ lat: number; lng: number } | null>(null);
  const [isSelectorOpen, setIsSelectorOpen] = useState(false);

  // Initialize map
  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    const map = L.map(mapRef.current, {
      center: [latitude || APP_CONFIG.DEFAULT_CENTER.lat, longitude || APP_CONFIG.DEFAULT_CENTER.lng],
      zoom: APP_CONFIG.DEFAULT_ZOOM,
      zoomControl: false,
    });

    L.tileLayer(APP_CONFIG.TILES.light, {
      attribution: APP_CONFIG.ATTRIBUTION,
    }).addTo(map);

    // Add zoom control to bottom right
    L.control.zoom({ position: 'bottomright' }).addTo(map);

    // Create markers layer
    const markersLayer = L.layerGroup().addTo(map);
    markersLayerRef.current = markersLayer;

    // Handle click on map
    map.on('click', (e: L.LeafletMouseEvent) => {
      setPendingClick({ lat: e.latlng.lat, lng: e.latlng.lng });
      setIsSelectorOpen(true);
    });

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Center map on user location when available
  useEffect(() => {
    if (mapInstanceRef.current && latitude && longitude && !loading) {
      mapInstanceRef.current.setView([latitude, longitude], APP_CONFIG.DEFAULT_ZOOM);
    }
  }, [latitude, longitude, loading]);

  // Render markers
  useEffect(() => {
    if (!markersLayerRef.current) return;

    // Clear existing markers
    markersLayerRef.current.clearLayers();

    // Add new markers
    markers.forEach((marker) => {
      const container = document.createElement('div');
      const root = createRoot(container);
      
      root.render(
        <MarkerIcon 
          type={marker.type} 
          createdAt={marker.createdAt}
          isFading={fadingMarkers.has(marker.id)}
        />
      );

      const icon = L.divIcon({
        html: container,
        className: 'custom-marker',
        iconSize: [48, 60],
        iconAnchor: [24, 60],
      });

      L.marker([marker.lat, marker.lng], { icon }).addTo(markersLayerRef.current!);
    });
  }, [markers, fadingMarkers]);

  // Handle marker type selection
  const handleTypeSelect = useCallback((type: MarkerType) => {
    if (pendingClick) {
      addMarker(pendingClick.lat, pendingClick.lng, type);
    }
    setIsSelectorOpen(false);
    setPendingClick(null);
  }, [pendingClick, addMarker]);

  // Handle selector close
  const handleSelectorClose = useCallback(() => {
    setIsSelectorOpen(false);
    setPendingClick(null);
  }, []);

  // Center on user location
  const handleCenterOnUser = useCallback(() => {
    if (mapInstanceRef.current && latitude && longitude) {
      mapInstanceRef.current.setView([latitude, longitude], APP_CONFIG.DEFAULT_ZOOM);
    } else {
      requestLocation();
    }
  }, [latitude, longitude, requestLocation]);

  return (
    <div className="relative w-full h-full">
      {/* Map container */}
      <div ref={mapRef} className="w-full h-full" />

      {/* Loading overlay */}
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/50 z-[500]">
          <div className="flex flex-col items-center gap-3 text-foreground">
            <Loader2 className="w-8 h-8 animate-spin" />
            <span className="text-sm">Визначення місцезнаходження...</span>
          </div>
        </div>
      )}

      {/* Error message */}
      {error && (
        <div className="absolute top-4 left-4 right-4 z-[500] p-4 bg-destructive/10 border border-destructive/20 rounded-xl">
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}

      {/* Center button */}
      <button
        onClick={handleCenterOnUser}
        className="absolute bottom-24 right-4 z-[500] touch-button w-14 h-14 
                   bg-card shadow-panel border border-border rounded-full
                   hover:bg-accent transition-colors"
        aria-label="Центрувати на моєму місцезнаходженні"
      >
        <Navigation className="w-6 h-6 text-primary" />
      </button>

      {/* Info panel */}
      <div className="absolute top-4 left-4 right-4 z-[500] p-3 bg-card/90 backdrop-blur-sm 
                      border border-border rounded-xl shadow-panel">
        <p className="text-sm text-center text-muted-foreground">
          Натисніть на карту, щоб додати мітку
        </p>
      </div>

      {/* Marker count */}
      {markers.length > 0 && (
        <div className="absolute top-20 left-4 z-[500] px-3 py-2 bg-card/90 backdrop-blur-sm 
                        border border-border rounded-lg shadow-panel">
          <p className="text-sm text-foreground">
            Міток поблизу: <span className="font-semibold">{markers.length}</span>
          </p>
        </div>
      )}

      {/* Marker type selector */}
      <MarkerTypeSelector
        isOpen={isSelectorOpen}
        onClose={handleSelectorClose}
        onSelect={handleTypeSelect}
      />
    </div>
  );
}
