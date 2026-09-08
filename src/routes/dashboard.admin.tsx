import { createFileRoute, redirect } from "@tanstack/react-router";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/empty-state";
import { Activity, CreditCard, FileText, ScrollText, Trash2, Users } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { adminApi } from "@/services/api";
import { toast } from "sonner";

export const Route = createFileRoute("/dashboard/admin")({
  beforeLoad: () => {
    if (typeof window === "undefined") return;
    let role: string | undefined;
    try {
      const raw = localStorage.getItem("auth.user");
      if (raw) role = (JSON.parse(raw) as { role?: string }).role;
    } catch {
      role = undefined;
    }
    if (role !== "admin") throw redirect({ to: "/dashboard" });
  },
  component: AdminPage,
  head: () => ({
    meta: [
      { title: "Admin panel · BizPal" },
      { name: "description", content: "Manage users, subscriptions, feature flags, uploads and audit logs." },
      { property: "og:title", content: "Admin panel · BizPal" },
      { property: "og:description", content: "Manage users, subscriptions, feature flags, uploads and audit logs." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
});

const fmtDate = (iso?: string | null) =>
  iso ? new Date(iso).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" }) : "—";
const fmtDateTime = (iso?: string | null) => (iso ? new Date(iso).toLocaleString() : "—");
const fmtSize = (bytes: number) => {
  if (!bytes) return "0 KB";
  const units = ["B", "KB", "MB", "GB"];
  const i = Math.min(units.length - 1, Math.floor(Math.log(bytes) / Math.log(1024)));
  return `${(bytes / 1024 ** i).toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
};

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-border bg-card shadow-card">
      <div className="border-b border-border p-4"><p className="text-sm font-semibold">{title}</p></div>
      {children}
    </div>
  );
}

function Table({ headers, children }: { headers: string[]; children: React.ReactNode }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border text-left text-xs uppercase tracking-wider text-muted-foreground">
            {headers.map((h) => <th key={h} className="px-4 py-3 font-medium">{h}</th>)}
          </tr>
        </thead>
        <tbody className="divide-y divide-border">{children}</tbody>
      </table>
    </div>
  );
}

function AdminPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">Admin Panel</h1>
        <p className="mt-1 text-sm text-muted-foreground">Manage users, monitor usage, and configure system settings.</p>
      </div>

      <Tabs defaultValue="users">
        <TabsList className="flex-wrap">
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="subs">Subscriptions</TabsTrigger>
          <TabsTrigger value="flags">Feature Flags</TabsTrigger>
          <TabsTrigger value="files">Uploads</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
          <TabsTrigger value="logs">Logs</TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="mt-4"><UsersTab /></TabsContent>
        <TabsContent value="subs" className="mt-4"><SubscriptionsTab /></TabsContent>
        <TabsContent value="flags" className="mt-4"><FlagsTab /></TabsContent>
        <TabsContent value="files" className="mt-4"><FilesTab /></TabsContent>
        <TabsContent value="activity" className="mt-4"><ActivityTab /></TabsContent>
        <TabsContent value="logs" className="mt-4"><LogsTab /></TabsContent>
      </Tabs>
    </div>
  );
}

function UsersTab() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ["admin", "users"], queryFn: () => adminApi.getUsers() });
  const update = useMutation({
    mutationFn: ({ id, role }: { id: string; role: string }) => adminApi.updateUserRole(id, role),
    onSuccess: () => { toast.success("Role updated"); qc.invalidateQueries({ queryKey: ["admin", "users"] }); },
    onError: (e: Error) => toast.error(e.message || "Could not update role"),
  });
  const users = data ?? [];

  return (
    <Panel title="User management">
      {isLoading ? <p className="p-4 text-sm text-muted-foreground">Loading...</p>
        : users.length === 0 ? <EmptyState icon={Users} title="No users yet" />
        : (
        <Table headers={["Name", "Email", "Role", "Joined"]}>
          {users.map((u) => (
            <tr key={u.id} className="transition-colors hover:bg-accent/30">
              <td className="px-4 py-3 font-medium">{u.fullName}</td>
              <td className="px-4 py-3 text-muted-foreground">{u.email}</td>
              <td className="px-4 py-3">
                <Select value={u.role?.toLowerCase()} onValueChange={(v) => update.mutate({ id: u.id, role: v })}>
                  <SelectTrigger className="h-8 w-[120px] capitalize"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="user">User</SelectItem>
                    <SelectItem value="analyst">Analyst</SelectItem>
                  </SelectContent>
                </Select>
              </td>
              <td className="px-4 py-3 text-muted-foreground">{fmtDate(u.createdAt)}</td>
            </tr>
          ))}
        </Table>
      )}
    </Panel>
  );
}

function SubscriptionsTab() {
  const { data, isLoading } = useQuery({ queryKey: ["admin", "subscriptions"], queryFn: () => adminApi.getSubscriptions() });
  const rows = data ?? [];
  return (
    <Panel title="Subscriptions overview">
      {isLoading ? <p className="p-4 text-sm text-muted-foreground">Loading...</p>
        : rows.length === 0 ? <EmptyState icon={CreditCard} title="No subscriptions yet" />
        : (
        <Table headers={["User", "Plan", "Status", "Renews"]}>
          {rows.map((s, i) => (
            <tr key={s.id ?? `${s.userEmail}-${i}`} className="transition-colors hover:bg-accent/30">
              <td className="px-4 py-3">{s.userEmail}</td>
              <td className="px-4 py-3 font-medium">{s.planName}</td>
              <td className="px-4 py-3"><Badge variant="secondary" className="capitalize">{s.status}</Badge></td>
              <td className="px-4 py-3 text-muted-foreground">{fmtDate(s.currentPeriodEnd)}</td>
            </tr>
          ))}
        </Table>
      )}
    </Panel>
  );
}

function FlagsTab() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ["admin", "flags"], queryFn: () => adminApi.getFeatureFlags() });
  const toggle = useMutation({
    mutationFn: ({ id, enabled }: { id: string; enabled: boolean }) => adminApi.toggleFeatureFlag(id, enabled),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "flags"] }),
    onError: (e: Error) => toast.error(e.message || "Could not update flag"),
  });
  const flags = data ?? [];

  return (
    <Panel title="Feature flags">
      {isLoading ? <p className="p-4 text-sm text-muted-foreground">Loading...</p>
        : flags.length === 0 ? <EmptyState title="No feature flags configured" />
        : (
        <div className="divide-y divide-border px-4">
          {flags.map((f) => (
            <div key={f.id} className="flex items-center justify-between py-3">
              <p className="text-sm font-medium">{f.name}</p>
              <Switch checked={f.enabled} onCheckedChange={(v) => toggle.mutate({ id: f.id, enabled: v })} />
            </div>
          ))}
        </div>
      )}
    </Panel>
  );
}

function FilesTab() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ["admin", "files"], queryFn: () => adminApi.getAllFiles() });
  const remove = useMutation({
    mutationFn: (id: string) => adminApi.deleteFile(id),
    onSuccess: () => { toast.success("File deleted"); qc.invalidateQueries({ queryKey: ["admin", "files"] }); },
    onError: (e: Error) => toast.error(e.message || "Could not delete file"),
  });
  const files = data ?? [];

  return (
    <Panel title="Manage uploads">
      {isLoading ? <p className="p-4 text-sm text-muted-foreground">Loading...</p>
        : files.length === 0 ? <EmptyState icon={FileText} title="No uploads yet" />
        : (
        <Table headers={["File", "Owner", "Size", "Uploaded", ""]}>
          {files.map((f) => (
            <tr key={f.id} className="transition-colors hover:bg-accent/30">
              <td className="px-4 py-3 font-medium">{f.name}</td>
              <td className="px-4 py-3 text-muted-foreground">{f.ownerEmail}</td>
              <td className="px-4 py-3">{fmtSize(f.size)}</td>
              <td className="px-4 py-3 text-muted-foreground">{fmtDate(f.uploadedAt)}</td>
              <td className="px-4 py-3 text-right">
                <Button size="icon" variant="ghost" aria-label="Delete file" disabled={remove.isPending} onClick={() => remove.mutate(f.id)}>
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </td>
            </tr>
          ))}
        </Table>
      )}
    </Panel>
  );
}

function ActivityTab() {
  const { data, isLoading } = useQuery({ queryKey: ["admin", "activity"], queryFn: () => adminApi.getActivity() });
  const items = data ?? [];
  return (
    <Panel title="Activity feed">
      {isLoading ? <p className="p-4 text-sm text-muted-foreground">Loading...</p>
        : items.length === 0 ? <EmptyState icon={Activity} title="No activity yet" />
        : (
        <ul className="divide-y divide-border">
          {items.map((a) => (
            <li key={a.id} className="flex items-start justify-between gap-4 px-4 py-3">
              <div>
                <p className="text-sm">{a.description}</p>
                <p className="text-xs text-muted-foreground">{a.userEmail}</p>
              </div>
              <span className="shrink-0 text-xs text-muted-foreground">{fmtDateTime(a.createdAt)}</span>
            </li>
          ))}
        </ul>
      )}
    </Panel>
  );
}

function LogsTab() {
  const { data, isLoading } = useQuery({ queryKey: ["admin", "logs"], queryFn: () => adminApi.getLogs() });
  const logs = data ?? [];
  return (
    <Panel title="Audit logs">
      {isLoading ? <p className="p-4 text-sm text-muted-foreground">Loading...</p>
        : logs.length === 0 ? <EmptyState icon={ScrollText} title="No log entries yet" />
        : (
        <Table headers={["Actor", "Action", "Details", "When"]}>
          {logs.map((l) => (
            <tr key={l.id} className="transition-colors hover:bg-accent/30">
              <td className="px-4 py-3">{l.actorEmail}</td>
              <td className="px-4 py-3 font-mono text-xs">{l.action}</td>
              <td className="px-4 py-3 text-muted-foreground">{l.details}</td>
              <td className="px-4 py-3 text-muted-foreground">{fmtDateTime(l.createdAt)}</td>
            </tr>
          ))}
        </Table>
      )}
    </Panel>
  );
}
