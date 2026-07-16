import { cn } from '@/lib/utils';

interface SkeletonLoaderProps {
  className?: string;
  variant?: 'circular' | 'rectangular' | 'text';
}

export function SkeletonLoader({ className, variant = 'rectangular' }: SkeletonLoaderProps) {
  return (
    <div
      className={cn(
        'animate-pulse bg-muted',
        variant === 'circular' && 'rounded-full',
        variant === 'rectangular' && 'rounded-md',
        variant === 'text' && 'h-4 w-full rounded-md',
        className
      )}
    />
  );
}
