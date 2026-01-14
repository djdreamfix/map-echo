import { useState, useEffect, useCallback } from 'react';
import { APP_CONFIG } from '@/config/app';

interface GeolocationState {
  latitude: number | null;
  longitude: number | null;
  error: string | null;
  loading: boolean;
}

export function useGeolocation() {
  const [state, setState] = useState<GeolocationState>({
    latitude: APP_CONFIG.DEFAULT_CENTER.lat,
    longitude: APP_CONFIG.DEFAULT_CENTER.lng,
    error: null,
    loading: true,
  });

  const updatePosition = useCallback((position: GeolocationPosition) => {
    setState({
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
      error: null,
      loading: false,
    });
  }, []);

  const handleError = useCallback((error: GeolocationPositionError) => {
    let message = 'Не вдалося отримати геолокацію';
    
    switch (error.code) {
      case error.PERMISSION_DENIED:
        message = 'Доступ до геолокації заборонено';
        break;
      case error.POSITION_UNAVAILABLE:
        message = 'Інформація про місцезнаходження недоступна';
        break;
      case error.TIMEOUT:
        message = 'Час очікування геолокації вичерпано';
        break;
    }
    
    setState((prev) => ({
      ...prev,
      error: message,
      loading: false,
    }));
  }, []);

  const requestLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setState((prev) => ({
        ...prev,
        error: 'Геолокація не підтримується вашим браузером',
        loading: false,
      }));
      return;
    }

    setState((prev) => ({ ...prev, loading: true }));
    
    navigator.geolocation.getCurrentPosition(updatePosition, handleError, {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 60000,
    });
  }, [updatePosition, handleError]);

  useEffect(() => {
    requestLocation();
  }, [requestLocation]);

  return {
    ...state,
    requestLocation,
  };
}
