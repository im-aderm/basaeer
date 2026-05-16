export default function SkeletonChart() {
  return (
    <div className="bg-white/75 border border-border/50 rounded-[2.5rem] p-8 animate-pulse">
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="h-5 w-40 bg-muted rounded mb-2" />
          <div className="h-3 w-56 bg-muted rounded" />
        </div>
        <div className="w-10 h-10 rounded-xl bg-muted" />
      </div>
      <div className="space-y-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex items-center gap-4">
            <div className="h-3 w-16 bg-muted rounded" />
            <div className="flex-1 h-8 bg-muted rounded" style={{ opacity: 1 - i * 0.15 }} />
            <div className="h-3 w-12 bg-muted rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}
