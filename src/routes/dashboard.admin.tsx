import { createFileRoute } from "@tanstack/react-router";
import { mockUsers, kpis } from "@/lib/mock-data";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import { MoreHorizontal, Plus, Activity, Users, Server, CreditCard } from "lucide-react";
import type { Role } from "@/lib/types";

export const Route = createFileRoute("/dashboard/admin")({
  component: AdminPage,
});

const fakeLogs = [
  { time: "10:42:18", level: "info", msg: "user.login alex@nova.ai" },
  { time: "10:41:02", level: "info", msg: "ai.chat completed in 920ms" },
  { time: "10:38:55", level: "warn", msg: "rate-limit approaching for tenant-04" },
  { time: "10:35:11", level: "info", msg: "file.upload Q4-revenue.csv (242KB)" },
  { time: "10:33:00", level: "error", msg: "summarize failed: token limit exceeded" },
  { time: "10:30:48", level: "info", msg: "user.invite priya@nova.ai" },
];

function AdminPage() {
  const [users, setUsers] = useState(mockUsers);
  const [flags, setFlags] = useState({ aiCopilot: true, betaAnalytics: false, exportApi: true });

  const updateRole = (id: string, role: Role) => {
    setUsers((u) => u.map((x) => (x.id === id ? { ...x, role } : x)));
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">Admin Panel</h1>
        <p className="mt-1 text-sm text-muted-foreground">Manage users, monitor usage, and configure system settings.</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { i: Users, l: "Users", v: "1,284", d: "+12 today" },
          { i: Server, l: "API Requests", v: "284k", d: "Last 24h" },
          { i: Activity, l: "Uptime", v: "99.98%", d: "30-day avg" },
          { i: CreditCard, l: "MRR", v: kpis[0].value, d: "+12.4%" },
        ].map((s) => (
          <div key={s.l} className="rounded-xl border border-border bg-card p-5 shadow-card">
            <div className="flex items-center justify-between"><p className="text-xs uppercase text-muted-foreground">{s.l}</p><s.i className="h-4 w-4 text-muted-foreground" /></div>
            <p className="mt-2 text-2xl font-semibold">{s.v}</p>
            <p className="mt-1 text-xs text-muted-foreground">{s.d}</p>
          </div>
        ))}
      </div>

      <Tabs defaultValue="users">
        <TabsList>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="flags">Feature Flags</TabsTrigger>
          <TabsTrigger value="logs">Logs</TabsTrigger>
          <TabsTrigger value="billing">Billing</TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="mt-4">
          <div className="rounded-xl border border-border bg-card shadow-card">
            <div className="flex items-center justify-between border-b border-border p-4">
              <p className="text-sm font-semibold">User management</p>
              <Button size="sm" className="bg-gradient-primary shadow-glow hover:opacity-90"><Plus className="mr-1.5 h-4 w-4" /> Invite user</Button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-xs uppercase tracking-wider text-muted-foreground">
                    <th className="px-4 py-3 font-medium">User</th>
                    <th className="px-4 py-3 font-medium">Email</th>
                    <th className="px-4 py-3 font-medium">Role</th>
                    <th className="px-4 py-3 font-medium">Joined</th>
                    <th className="px-4 py-3" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {users.map((u) => (
                    <tr key={u.id} className="transition-colors hover:bg-accent/30">
                      <td className="px-4 py-3"><div className="flex items-center gap-2"><div className="grid h-7 w-7 place-items-center rounded-full bg-gradient-primary text-[11px] font-medium text-primary-foreground">{u.name.split(" ").map(p => p[0]).join("")}</div><span className="font-medium">{u.name}</span></div></td>
                      <td className="px-4 py-3 text-muted-foreground">{u.email}</td>
                      <td className="px-4 py-3">
                        <Select value={u.role} onValueChange={(v) => updateRole(u.id, v as Role)}>
                          <SelectTrigger className="h-8 w-[120px] capitalize"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="admin">Admin</SelectItem>
                            <SelectItem value="analyst">Analyst</SelectItem>
                            <SelectItem value="user">User</SelectItem>
                          </SelectContent>
                        </Select>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{u.createdAt}</td>
                      <td className="px-4 py-3 text-right"><Button size="icon" variant="ghost"><MoreHorizontal className="h-4 w-4" /></Button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="flags" className="mt-4">
          <div className="rounded-xl border border-border bg-card p-5 shadow-card">
            <p className="text-sm font-semibold">Feature flags</p>
            <div className="mt-4 divide-y divide-border">
              {Object.entries(flags).map(([k, v]) => (
                <div key={k} className="flex items-center justify-between py-3">
                  <div>
                    <p className="text-sm font-medium capitalize">{k.replace(/([A-Z])/g, " $1").trim()}</p>
                    <p className="text-xs text-muted-foreground">Toggle availability for all users in this workspace.</p>
                  </div>
                  <Switch checked={v} onCheckedChange={(c) => setFlags({ ...flags, [k]: c })} />
                </div>
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="logs" className="mt-4">
          <div className="rounded-xl border border-border bg-card shadow-card">
            <div className="border-b border-border p-4 text-sm font-semibold">System logs</div>
            <div className="font-mono text-xs">
              {fakeLogs.map((l, i) => (
                <div key={i} className="flex gap-3 border-b border-border/60 px-4 py-2 last:border-0">
                  <span className="text-muted-foreground">{l.time}</span>
                  <span className={l.level === "error" ? "text-destructive" : l.level === "warn" ? "text-warning" : "text-success"}>{l.level.toUpperCase().padEnd(5)}</span>
                  <span>{l.msg}</span>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="billing" className="mt-4">
          <div className="grid gap-4 sm:grid-cols-3">
            {[{ p: "Starter", n: 412 }, { p: "Pro", n: 728 }, { p: "Scale", n: 144 }].map((b) => (
              <div key={b.p} className="rounded-xl border border-border bg-card p-5 shadow-card">
                <p className="text-xs uppercase text-muted-foreground">{b.p}</p>
                <p className="mt-2 text-2xl font-semibold">{b.n} <span className="text-sm font-normal text-muted-foreground">subscribers</span></p>
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
