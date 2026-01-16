import { motion } from 'framer-motion';
import { MarkerType } from '../lib/store';
import { cn } from '@/lib/utils';
import { X } from 'lucide-react';

interface Props {
  onSelect: (type: MarkerType) => void;
  onCancel: () => void;
  isOpen: boolean;
}

export function MarkerControl({ onSelect, onCancel, isOpen }: Props) {
  if (!isOpen) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 p-6 z-50 flex flex-col items-center justify-end pointer-events-none">
      <motion.div 
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        className="bg-card/90 backdrop-blur-xl border border-border shadow-2xl rounded-3xl p-6 w-full max-w-md pointer-events-auto pb-10"
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-display font-bold text-foreground">Виберіть мітку</h2>
          <button 
            onClick={onCancel}
            className="p-2 rounded-full hover:bg-muted/50 transition-colors"
          >
            <X className="w-6 h-6 text-muted-foreground" />
          </button>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <button 
            onClick={() => onSelect('blue')}
            className="flex flex-col items-center gap-3 group"
          >
            <div className="w-16 h-16 rounded-full bg-[#007AFF] shadow-lg group-hover:scale-110 transition-transform duration-200 border-2 border-transparent group-hover:border-white/50" />
            <span className="text-sm font-medium text-muted-foreground">Синя</span>
          </button>

          <button 
            onClick={() => onSelect('green')}
            className="flex flex-col items-center gap-3 group"
          >
            <div className="w-16 h-16 rounded-full bg-[#34C759] shadow-lg group-hover:scale-110 transition-transform duration-200 border-2 border-transparent group-hover:border-white/50" />
            <span className="text-sm font-medium text-muted-foreground">Зелена</span>
          </button>

          <button 
            onClick={() => onSelect('split')}
            className="flex flex-col items-center gap-3 group"
          >
            <div className="w-16 h-16 rounded-full shadow-lg group-hover:scale-110 transition-transform duration-200 border-2 border-transparent group-hover:border-white/50" 
                 style={{ background: 'linear-gradient(135deg, #007AFF 50%, #34C759 50%)' }}
            />
            <span className="text-sm font-medium text-muted-foreground">Мікс</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
}
