export default function SkeletonMetric() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="bg-white/75 border border-border/50 rounded-[2.5rem] p-8 animate-pulse">
          <div className="flex items-start justify-between mb-4">
            <div className="h-4 w-24 bg-muted rounded" />
            <div className="w-10 h-10 rounded-xl bg-muted" />
          </div>
          <div className="h-8 w-32 bg-muted rounded mb-3" />
          <div className="h-3 w-20 bg-muted rounded" />
        </div>
      ))}
    </div>
  );
}
