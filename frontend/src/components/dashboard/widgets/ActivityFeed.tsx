"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { AlertCircle, Activity, Users, DollarSign, BookOpen, UserPlus, Settings, LogIn } from "lucide-react";
import { auditLogService, AuditLogEntry } from "@/services/auditLogService";

const ICON_MAP: Record<string, typeof Activity> = {
  auth: LogIn,
  finance: DollarSign,
  academic: BookOpen,
  users: Users,
  user: Users,
  settings: Settings,
  registration: UserPlus,
};

function getModuleIcon(module: string) {
  return ICON_MAP[module.toLowerCase()] ?? Activity;
}

function getRelativeTime(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diffMs = now - then;
  if (diffMs < 0) return "just now";
  const seconds = Math.floor(diffMs / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString();
}

function Skeleton() {
  return (
    <Card className="rounded-[2.5rem] border-border/50 shadow-xl animate-pulse">
      <div className="p-6 pb-4">
        <div className="h-5 w-36 bg-muted rounded" />
      </div>
      <div className="px-6 pb-6 space-y-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-muted shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-3 w-3/4 bg-muted rounded" />
              <div className="h-2.5 w-1/4 bg-muted rounded" />
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

function EmptyState() {
  return (
    <Card className="rounded-[2.5rem] border-border/50 shadow-xl">
      <div className="p-6 flex flex-col items-center justify-center gap-2" style={{ minHeight: 200 }}>
        <Activity className="w-10 h-10 text-muted-foreground/30" />
        <p className="text-sm text-muted-foreground/60">No recent activity</p>
      </div>
    </Card>
  );
}

function ErrorState({ message }: { message: string }) {
  return (
    <Card className="rounded-[2.5rem] border-destructive/20 shadow-xl">
      <div className="p-6 flex flex-col items-center justify-center gap-2" style={{ minHeight: 200 }}>
        <AlertCircle className="w-10 h-10 text-destructive/50" />
        <p className="text-sm text-destructive/70">{message}</p>
      </div>
    </Card>
  );
}

export function ActivityFeed() {
  const [entries, setEntries] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    auditLogService.getRecent(10).then((data) => {
      if (!cancelled) {
        setEntries(data);
        setLoading(false);
      }
    }).catch((err) => {
      if (!cancelled) {
        setError(err?.response?.data?.message || err?.message || "Failed to load activity");
        setLoading(false);
      }
    });
    return () => { cancelled = true; };
  }, []);

  if (loading) return <Skeleton />;
  if (error) return <ErrorState message={error} />;
  if (entries.length === 0) return <EmptyState />;

  return (
    <Card className="rounded-[2.5rem] border-border/50 shadow-xl bg-card overflow-hidden">
      <div className="p-6 pb-4">
        <h3 className="text-h3 font-semibold">Recent Activity</h3>
      </div>
      <div className={entries.length > 5 ? "max-h-[340px] overflow-y-auto" : ""}>
        <div className="px-6 pb-6 space-y-1">
          {entries.map((entry) => {
            const ItemIcon = getModuleIcon(entry.module);
            return (
              <div key={entry.id} className="flex items-start gap-3 py-2">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                  <ItemIcon size={14} className="text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-medium truncate">
                      {entry.user?.firstName} {entry.user?.lastName}
                    </span>
                    <span className="text-xs capitalize px-1.5 py-0.5 rounded bg-muted text-muted-foreground font-medium">
                      {entry.module}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {entry.action}
                    {entry.details && <span className="text-muted-foreground/60"> &mdash; {entry.details}</span>}
                  </p>
                  <p className="text-[11px] text-muted-foreground/50 mt-0.5">{getRelativeTime(entry.createdAt)}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </Card>
  );
}
