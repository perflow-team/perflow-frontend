interface SkeletonProps {
  className?: string
}

// A single pulsing placeholder block. Compose width/height/shape via
// className (e.g. "h-4 w-32", "h-[300px] w-[230px] rounded-lg").
function Skeleton({ className = '' }: SkeletonProps) {
  return <div className={`animate-pulse rounded-md bg-neutral-200 ${className}`} />
}

export default Skeleton
