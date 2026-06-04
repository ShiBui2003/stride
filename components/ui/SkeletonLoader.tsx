// Animated skeleton placeholder shown while async content is loading
interface SkeletonLoaderProps {
  className?: string;
  count?: number;
}

export function SkeletonLoader({ className = '', count = 1 }: SkeletonLoaderProps) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className={`bg-surface rounded-xl animate-pulse ${className}`}
        />
      ))}
    </>
  );
}
