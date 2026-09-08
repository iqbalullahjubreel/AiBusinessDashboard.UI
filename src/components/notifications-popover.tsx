import type { ReactNode } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Check, Info, AlertTriangle, AlertCircle, BellOff } from "lucide-react";
import { cn } from "@/lib/utils";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { notificationsApi } from "@/services/api";
import type { NotificationItem } from "@/lib/types";
import { EmptyState } from "@/components/empty-state";

const iconMap = {
  success: Check,
  info: Info,
  warning: AlertTriangle,
  error: AlertCircle,
};

export const notificationsQueryKey = ["notifications"] as const;

export function useNotifications() {
  return useQuery({
    queryKey: notificationsQueryKey,
    queryFn: () => notificationsApi.list(),
    staleTime: 30_000,
  });
}

function relative(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.round(diff / 60000);
  if (!Number.isFinite(m)) return "";
  if (m < 1) return "now";
  if (m < 60) return `${m}m`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h}h`;
  return `${Math.round(h / 24)}d`;
}

export function NotificationsPopover({ children }: { children: ReactNode }) {
  const qc = useQueryClient();
  const { data, isLoading } = useNotifications();
  const items: NotificationItem[] = data ?? [];

  const invalidate = () => qc.invalidateQueries({ queryKey: notificationsQueryKey });
  const markRead = useMutation({ mutationFn: (id: string) => notificationsApi.markRead(id), onSuccess: invalidate });
  const markAll = useMutation({ mutationFn: () => notificationsApi.markAllRead(), onSuccess: invalidate });

  return (
    <Popover>
      <PopoverTrigger asChild>{children}</PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0">
        <div className="flex items-center justify-between border-b border-border p-3">
          <p className="text-sm font-semibold">Notifications</p>
          <button
            className="text-xs text-primary hover:underline disabled:opacity-50"
            onClick={() => markAll.mutate()}
            disabled={markAll.isPending || items.every((n) => n.isRead)}
          >
            Mark all read
          </button>
        </div>
        {isLoading ? (
          <p className="p-4 text-xs text-muted-foreground">Loading...</p>
        ) : items.length === 0 ? (
          <EmptyState icon={BellOff} title="No notifications yet" description="Updates about your workspace will show up here." />
        ) : (
          <ul className="max-h-80 divide-y divide-border overflow-y-auto">
            {items.map((n) => {
              const Icon = iconMap[n.type] ?? Info;
              return (
                <li key={n.id}>
                  <button
                    onClick={() => { if (!n.isRead) markRead.mutate(n.id); }}
                    className={cn(
                      "flex w-full gap-3 p-3 text-left transition-colors hover:bg-accent/40",
                      !n.isRead && "bg-accent/20",
                    )}
                  >
                    <div className={cn(
                      "mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-lg",
                      n.type === "success" && "bg-success/10 text-success",
                      n.type === "info" && "bg-primary/10 text-primary",
                      n.type === "warning" && "bg-warning/10 text-warning",
                      n.type === "error" && "bg-destructive/10 text-destructive",
                    )}>
                      <Icon className="h-3.5 w-3.5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium">{n.title}</p>
                      <p className="truncate text-xs text-muted-foreground">{n.description}</p>
                    </div>
                    <span className="text-[10px] text-muted-foreground">{relative(n.createdAt)}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </PopoverContent>
    </Popover>
  );
}
