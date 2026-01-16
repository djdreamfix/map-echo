import { useEffect, useRef, useState } from 'react';
import { Marker as LeafletMarker } from 'react-leaflet';
import L from 'leaflet';
import { Marker } from '../lib/store';

// Helper to format time
const formatTime = (ms: number) => {
  if (ms <= 0) return "0:00";
  const minutes = Math.floor(ms / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};

export function TimerMarker({ marker }: { marker: Marker }) {
  const markerRef = useRef<L.Marker>(null);
  const [_, setTick] = useState(0); // Force re-render for icon update

  useEffect(() => {
    const interval = setInterval(() => {
      setTick(t => t + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const now = Date.now();
  const diff = marker.expiresAt - now;
  const isExpiring = diff < 1000 && diff > 0;
  
  const icon = L.divIcon({
    className: 'custom-div-icon',
    html: `
      <div class="marker-pin marker-${marker.type} ${isExpiring ? 'marker-expiring' : ''}">
        <span>${formatTime(diff)}</span>
      </div>
    `,
    iconSize: [48, 48],
    iconAnchor: [24, 24]
  });

  return (
    <LeafletMarker
      ref={markerRef}
      position={[marker.lat, marker.lng]}
      icon={icon}
    />
  );
}
