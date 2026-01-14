import { MapView } from '@/components/MapView';
import { useTheme } from '@/hooks/useTheme';

const Index = () => {
  // Initialize theme
  useTheme();

  return (
    <main className="fixed inset-0 overflow-hidden bg-background">
      <MapView />
    </main>
  );
};

export default Index;
