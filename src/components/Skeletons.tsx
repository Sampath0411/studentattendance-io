const SkeletonCard = () => (
  <div className="glass-card rounded-2xl p-6 space-y-3">
    <div className="skeleton-shimmer h-4 w-24 rounded-lg" />
    <div className="skeleton-shimmer h-8 w-16 rounded-lg" />
  </div>
);

const SkeletonTable = () => (
  <div className="glass-card rounded-2xl p-6 space-y-4">
    <div className="skeleton-shimmer h-5 w-48 rounded-lg" />
    <div className="space-y-3">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex gap-4">
          <div className="skeleton-shimmer h-4 w-24 rounded-lg" />
          <div className="skeleton-shimmer h-4 w-20 rounded-lg" />
          <div className="skeleton-shimmer h-4 w-40 rounded-lg" />
          <div className="skeleton-shimmer h-4 w-16 rounded-lg" />
        </div>
      ))}
    </div>
  </div>
);

const SkeletonCircle = () => (
  <div className="flex justify-center">
    <div className="skeleton-shimmer w-40 h-40 rounded-full" />
  </div>
);

export { SkeletonCard, SkeletonTable, SkeletonCircle };
