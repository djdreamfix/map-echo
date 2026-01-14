// Haversine formula to calculate distance between two points
export function haversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);
  
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  
  return R * c; // Distance in kilometers
}

function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

// Filter markers within radius
export function filterMarkersByRadius<T extends { lat: number; lng: number }>(
  markers: T[],
  userLat: number,
  userLng: number,
  radiusKm: number
): T[] {
  return markers.filter((marker) => {
    const distance = haversineDistance(userLat, userLng, marker.lat, marker.lng);
    return distance <= radiusKm;
  });
}

// Format time as mm:ss
export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

// Calculate elapsed time since creation
export function getElapsedSeconds(createdAt: number): number {
  return Math.floor((Date.now() - createdAt) / 1000);
}

// Check if marker should start fading
export function shouldFade(createdAt: number, ttlSeconds: number, fadeStartBefore: number): boolean {
  const elapsed = getElapsedSeconds(createdAt);
  return elapsed >= ttlSeconds - fadeStartBefore;
}

// Check if marker is expired
export function isExpired(createdAt: number, ttlSeconds: number): boolean {
  const elapsed = getElapsedSeconds(createdAt);
  return elapsed >= ttlSeconds;
}
