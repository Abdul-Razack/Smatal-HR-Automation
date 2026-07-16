import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AppLoaderProps {
  className?: string;
  fullScreen?: boolean;
}

export function AppLoader({ className, fullScreen = false }: AppLoaderProps) {
  return (
    <div
      className={cn(
        'flex items-center justify-center',
        fullScreen && 'fixed inset-0 z-50 bg-background/80 backdrop-blur-sm',
        className
      )}
    >
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );
}
