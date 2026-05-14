import { cn } from "@/lib/utils";

interface DashboardGridProps {
  children: React.ReactNode;
  className?: string;
  cols?: 1 | 2 | 3 | 4 | 6;
}

const gridCols = {
  1: "grid-cols-1",
  2: "grid-cols-1 md:grid-cols-2",
  3: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
  4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
  6: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6",
};

/**
 * Responsive dashboard grid with consistent gap and column configuration.
 */
export function DashboardGrid({ children, className, cols = 4 }: DashboardGridProps) {
  return (
    <div className={cn("grid gap-6", gridCols[cols], className)}>
      {children}
    </div>
  );
}

/**
 * Two-column split layout for charts and content sections.
 */
export function DashboardSplit({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("grid grid-cols-1 lg:grid-cols-2 gap-8", className)}>
      {children}
    </div>
  );
}

/**
 * Full-width section with consistent padding and spacing.
 */
export function DashboardSection({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("space-y-6", className)}>
      {children}
    </div>
  );
}
