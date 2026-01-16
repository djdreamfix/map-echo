import { useState, useEffect } from 'react';
import MapView from '../components/Map';
import { MarkerControl } from '../components/MarkerControl';
import { useMarkerStore } from '../lib/store';
import { Toaster, toast } from 'sonner';
import { WifiOff } from 'lucide-react';

export default function Home() {
  const { markers, addMarker, userLocation } = useMarkerStore();
  const [isPicking, setIsPicking] = useState(false);
  const [tempLocation, setTempLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleMapClick = (lat: number, lng: number) => {
    if (!isOnline) {
      toast.error("Ви оффлайн. Неможливо додати мітку.", {
        icon: <WifiOff className="w-4 h-4" />
      });
      return;
    }
    setTempLocation({ lat, lng });
    setIsPicking(true);
  };

  const handleSelectType = (type: 'blue' | 'green' | 'split') => {
    if (tempLocation) {
      addMarker(tempLocation.lat, tempLocation.lng, type);
      setIsPicking(false);
      setTempLocation(null);
      toast.success("Мітку додано!");
    }
  };

  const handleCancel = () => {
    setIsPicking(false);
    setTempLocation(null);
  };

  return (
    <div className="w-full h-[100dvh] overflow-hidden bg-background relative flex flex-col">
      <div className="flex-1 relative z-0">
        <MapView 
          markers={markers} 
          userLocation={userLocation}
          onMapClick={handleMapClick}
          isPicking={isPicking}
        />
      </div>

      <MarkerControl 
        isOpen={isPicking}
        onSelect={handleSelectType}
        onCancel={handleCancel}
      />

      <Toaster position="top-center" />
      
      {!isOnline && (
        <div className="absolute top-0 left-0 right-0 bg-destructive text-destructive-foreground p-2 text-center text-sm font-medium z-50">
          Відсутнє з'єднання з інтернетом
        </div>
      )}
    </div>
  );
}
