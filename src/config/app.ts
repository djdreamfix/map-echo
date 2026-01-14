// Application configuration
export const APP_CONFIG = {
  // Visibility radius in kilometers
  VISIBILITY_RADIUS_KM: 5,
  
  // Marker TTL in seconds (30 minutes)
  MARKER_TTL_SECONDS: 1800,
  
  // Fade out animation duration in milliseconds
  FADE_OUT_DURATION_MS: 800,
  
  // Start fade out animation this many seconds before deletion
  FADE_OUT_START_BEFORE_SECONDS: 5,
  
  // Timer update interval in milliseconds
  TIMER_UPDATE_INTERVAL_MS: 1000,
  
  // Default map center (Kyiv, Ukraine)
  DEFAULT_CENTER: {
    lat: 50.4501,
    lng: 30.5234,
  },
  
  // Default zoom level
  DEFAULT_ZOOM: 15,
  
  // Map tile URLs
  TILES: {
    light: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    dark: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
  },
  
  // Attribution
  ATTRIBUTION: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
} as const;

export type MarkerType = 'blue' | 'green' | 'split';

export interface MapMarker {
  id: string;
  lat: number;
  lng: number;
  type: MarkerType;
  createdAt: number; // timestamp
}
