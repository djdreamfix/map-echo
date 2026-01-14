import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { MarkerType, APP_CONFIG } from '@/config/app';
import { formatTime, getElapsedSeconds } from '@/utils/geo';

interface MarkerIconProps {
  type: MarkerType;
  createdAt: number;
  isFading: boolean;
}

export function MarkerIcon({ type, createdAt, isFading }: MarkerIconProps) {
  const [elapsed, setElapsed] = useState(() => getElapsedSeconds(createdAt));

  useEffect(() => {
    const interval = setInterval(() => {
      const newElapsed = getElapsedSeconds(createdAt);
      setElapsed(Math.min(newElapsed, APP_CONFIG.MARKER_TTL_SECONDS));
    }, APP_CONFIG.TIMER_UPDATE_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [createdAt]);

  const getMarkerStyle = () => {
    switch (type) {
      case 'blue':
        return 'bg-marker-blue';
      case 'green':
        return 'bg-marker-green';
      case 'split':
        return 'bg-gradient-to-br from-marker-blue to-marker-green';
      default:
        return 'bg-marker-blue';
    }
  };

  return (
    <motion.div
      className="relative flex flex-col items-center"
      initial={{ scale: 0, opacity: 0 }}
      animate={isFading 
        ? { scale: 0.9, opacity: 0 } 
        : { scale: 1, opacity: 1 }
      }
      transition={{ 
        duration: isFading ? APP_CONFIG.FADE_OUT_DURATION_MS / 1000 : 0.3,
        ease: 'easeOut'
      }}
    >
      {/* Pulse effect */}
      <div className={`absolute w-12 h-12 rounded-full ${getMarkerStyle()} opacity-30 animate-ping`} />
      
      {/* Main marker */}
      <div
        className={`relative w-12 h-12 rounded-full ${getMarkerStyle()} 
                    shadow-lg flex items-center justify-center
                    border-2 border-background`}
      >
        {/* Timer display */}
        <span className="text-xs font-bold text-white drop-shadow-md">
          {formatTime(elapsed)}
        </span>
      </div>
      
      {/* Pointer */}
      <div 
        className={`w-3 h-3 ${getMarkerStyle()} rotate-45 -mt-1.5 
                    border-r-2 border-b-2 border-background shadow-md`}
      />
    </motion.div>
  );
}
