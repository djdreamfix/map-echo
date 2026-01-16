import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, useMap, useMapEvents, Marker as LeafletMarker } from 'react-leaflet';
import L from 'leaflet';
import { Marker } from '../lib/store';
import { TimerMarker } from './TimerMarker';

// Fix for default leaflet icons in React
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

interface MapProps {
  markers: Marker[];
  userLocation: { lat: number; lng: number } | null;
  onMapClick: (lat: number, lng: number) => void;
  isPicking: boolean;
}

function MapEvents({ onMapClick, isPicking }: { onMapClick: (lat: number, lng: number) => void, isPicking: boolean }) {
  useMapEvents({
    click(e) {
      if (!isPicking) {
        onMapClick(e.latlng.lat, e.latlng.lng);
      }
    },
  });
  return null;
}

function CenterMap({ center }: { center: { lat: number; lng: number } | null }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.flyTo(center, 15, { animate: true, duration: 1.5 });
    }
  }, [center, map]);
  return null;
}

export default function MapView({ markers, userLocation, onMapClick, isPicking }: MapProps) {
  // Default center: Kyiv
  const defaultCenter = { lat: 50.4501, lng: 30.5234 };
  const center = userLocation || defaultCenter;

  return (
    <div className="w-full h-full relative z-0">
      <MapContainer 
        center={center} 
        zoom={13} 
        zoomControl={false}
        className="w-full h-full"
        style={{ background: 'var(--background)' }}
      >
        <TileLayer
          attribution='&copy; OpenStreetMap'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        <CenterMap center={userLocation} />
        <MapEvents onMapClick={onMapClick} isPicking={isPicking} />

        {markers.map(marker => (
          <TimerMarker key={marker.id} marker={marker} />
        ))}

        {userLocation && (
           <LeafletMarker 
             position={userLocation}
             zIndexOffset={1000}
             icon={L.divIcon({
               className: 'custom-div-icon',
               html: '<div style="width: 16px; height: 16px; background: #007AFF; border: 3px solid white; border-radius: 50%; box-shadow: 0 0 0 10px rgba(0, 122, 255, 0.2);"></div>',
               iconSize: [16, 16],
               iconAnchor: [8, 8]
             })}
           />
        )}
      </MapContainer>
    </div>
  );
}
