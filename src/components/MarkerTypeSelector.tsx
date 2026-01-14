import { motion, AnimatePresence } from 'framer-motion';
import { X, Check } from 'lucide-react';
import { MarkerType } from '@/config/app';
import { useState } from 'react';

interface MarkerTypeSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (type: MarkerType) => void;
}

export function MarkerTypeSelector({ isOpen, onClose, onSelect }: MarkerTypeSelectorProps) {
  const [selected, setSelected] = useState<MarkerType | null>(null);

  const handleConfirm = () => {
    if (selected) {
      onSelect(selected);
      setSelected(null);
    }
  };

  const handleClose = () => {
    setSelected(null);
    onClose();
  };

  const types: { type: MarkerType; label: string; style: string }[] = [
    { type: 'blue', label: 'Синій', style: 'bg-marker-blue' },
    { type: 'green', label: 'Зелений', style: 'bg-marker-green' },
    { type: 'split', label: 'Мікс', style: 'bg-gradient-to-r from-marker-blue to-marker-green' },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/30 z-[1000]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
          />
          
          {/* Panel */}
          <motion.div
            className="fixed bottom-0 left-0 right-0 z-[1001] 
                       bg-panel border-t border-panel-border
                       rounded-t-2xl shadow-panel p-6 pb-8"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-foreground">
                Оберіть тип мітки
              </h2>
              <button
                onClick={handleClose}
                className="touch-button w-10 h-10 bg-muted hover:bg-accent"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Type options */}
            <div className="grid grid-cols-3 gap-3 mb-6">
              {types.map(({ type, label, style }) => (
                <button
                  key={type}
                  onClick={() => setSelected(type)}
                  className={`touch-button flex-col gap-2 p-4 rounded-xl border-2 transition-all
                             ${selected === type 
                               ? 'border-primary bg-primary/10' 
                               : 'border-border bg-card hover:border-muted-foreground'}`}
                >
                  <div className={`w-10 h-10 rounded-full ${style} shadow-md`} />
                  <span className="text-sm font-medium text-foreground">{label}</span>
                </button>
              ))}
            </div>

            {/* Confirm button */}
            <button
              onClick={handleConfirm}
              disabled={!selected}
              className={`touch-button w-full py-4 rounded-xl font-semibold text-lg
                         transition-all duration-200
                         ${selected 
                           ? 'bg-primary text-primary-foreground hover:bg-primary/90' 
                           : 'bg-muted text-muted-foreground cursor-not-allowed'}`}
            >
              <Check className="w-5 h-5 mr-2" />
              Підтвердити
            </button>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
