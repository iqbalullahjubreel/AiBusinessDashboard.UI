import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { notificationPreferencesApi } from "@/services/api";
import { Switch } from "@/components/ui/switch";
import { EmptyState } from "@/components/empty-state";
import { toast } from "sonner";

export function NotificationPreferencesCard() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ["notification-preferences"], queryFn: () => notificationPreferencesApi.list() });
  const update = useMutation({
    mutationFn: ({ category, enabled }: { category: string; enabled: boolean }) => notificationPreferencesApi.update(category, enabled),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["notification-preferences"] }),
    onError: (e: Error) => toast.error(e.message || "Could not save preference"),
  });

  const prefs = data ?? [];

  return (
    <div className="rounded-xl border border-border bg-card p-5 shadow-card">
      <p className="text-sm font-semibold">Notification preferences</p>
      <p className="text-xs text-muted-foreground">Choose what you want to be notified about.</p>
      <div className="mt-4">
        {isLoading ? (
          <p className="text-sm text-muted-foreground">Loading...</p>
        ) : prefs.length === 0 ? (
          <EmptyState title="No preferences available" />
        ) : (
          <div className="divide-y divide-border">
            {prefs.map((p) => (
              <div key={p.category} className="flex items-center justify-between py-3">
                <p className="text-sm font-medium">{p.displayName}</p>
                <Switch checked={p.enabled} onCheckedChange={(v) => update.mutate({ category: p.category, enabled: v })} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
