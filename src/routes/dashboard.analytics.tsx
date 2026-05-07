import { createFileRoute } from "@tanstack/react-router";
import { Area, AreaChart, Bar, BarChart, Cell, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid, Legend } from "recharts";
import { revenueSeries, aiUsageSeries, conversionSeries, mockUsers } from "@/lib/mock-data";
import { Button } from "@/components/ui/button";
import { Download, Calendar } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export const Route = createFileRoute("/dashboard/analytics")({
  component: AnalyticsPage,
});

const palette = ["var(--color-chart-1)", "var(--color-chart-2)", "var(--color-chart-3)", "var(--color-chart-4)"];

function AnalyticsPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">Analytics</h1>
          <p className="mt-1 text-sm text-muted-foreground">Deep insights across revenue, users, and AI usage.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Select defaultValue="30">
            <SelectTrigger className="w-[180px]"><Calendar className="mr-2 h-4 w-4" /><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="90">Last 90 days</SelectItem>
              <SelectItem value="365">Last 12 months</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm"><Download className="mr-1.5 h-4 w-4" /> Export</Button>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <ChartCard title="Revenue trend" subtitle="Monthly recurring revenue">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={revenueSeries}>
              <defs><linearGradient id="rev2" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="var(--color-primary)" stopOpacity={0.4} /><stop offset="100%" stopColor="var(--color-primary)" stopOpacity={0} /></linearGradient></defs>
              <CartesianGrid stroke="var(--color-border)" strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="m" stroke="var(--color-muted-foreground)" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis stroke="var(--color-muted-foreground)" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `$${v / 1000}k`} />
              <Tooltip contentStyle={{ background: "var(--color-popover)", border: "1px solid var(--color-border)", borderRadius: 8, fontSize: 12 }} />
              <Area type="monotone" dataKey="revenue" stroke="var(--color-primary)" strokeWidth={2} fill="url(#rev2)" />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="User growth" subtitle="Total active users">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={revenueSeries}>
              <CartesianGrid stroke="var(--color-border)" strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="m" stroke="var(--color-muted-foreground)" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis stroke="var(--color-muted-foreground)" fontSize={11} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={{ background: "var(--color-popover)", border: "1px solid var(--color-border)", borderRadius: 8, fontSize: 12 }} />
              <Line type="monotone" dataKey="users" stroke="var(--color-chart-2)" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="AI requests by type" subtitle="Daily breakdown">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={aiUsageSeries}>
              <CartesianGrid stroke="var(--color-border)" strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="d" stroke="var(--color-muted-foreground)" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis stroke="var(--color-muted-foreground)" fontSize={11} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={{ background: "var(--color-popover)", border: "1px solid var(--color-border)", borderRadius: 8, fontSize: 12 }} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="chat" fill="var(--color-chart-1)" radius={[4, 4, 0, 0]} />
              <Bar dataKey="summarize" fill="var(--color-chart-2)" radius={[4, 4, 0, 0]} />
              <Bar dataKey="files" fill="var(--color-chart-3)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Conversion sources" subtitle="Where signups come from">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Tooltip contentStyle={{ background: "var(--color-popover)", border: "1px solid var(--color-border)", borderRadius: 8, fontSize: 12 }} />
              <Pie data={conversionSeries} dataKey="value" nameKey="name" innerRadius={50} outerRadius={90} paddingAngle={2}>
                {conversionSeries.map((_, i) => <Cell key={i} fill={palette[i % palette.length]} />)}
              </Pie>
              <Legend wrapperStyle={{ fontSize: 11 }} />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <div className="rounded-xl border border-border bg-card p-5 shadow-card">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold">Top users by AI usage</p>
          <Button variant="ghost" size="sm">View all</Button>
        </div>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs uppercase tracking-wider text-muted-foreground">
                <th className="pb-2 font-medium">User</th>
                <th className="pb-2 font-medium">Role</th>
                <th className="pb-2 font-medium">Requests</th>
                <th className="pb-2 font-medium">Avg latency</th>
                <th className="pb-2 font-medium">Last active</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {mockUsers.map((u, i) => (
                <tr key={u.id} className="transition-colors hover:bg-accent/30">
                  <td className="py-3"><div className="flex items-center gap-2"><div className="grid h-7 w-7 place-items-center rounded-full bg-gradient-primary text-[11px] font-medium text-primary-foreground">{u.name.split(" ").map(p => p[0]).join("")}</div><span className="font-medium">{u.name}</span></div></td>
                  <td className="py-3"><span className="rounded-full bg-accent px-2 py-0.5 text-xs capitalize">{u.role}</span></td>
                  <td className="py-3">{(2400 - i * 280).toLocaleString()}</td>
                  <td className="py-3">{(0.8 + i * 0.12).toFixed(2)}s</td>
                  <td className="py-3 text-muted-foreground">{i === 0 ? "Just now" : `${i * 2}h ago`}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function ChartCard({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-border bg-card p-5 shadow-card">
      <p className="text-sm font-semibold">{title}</p>
      <p className="text-xs text-muted-foreground">{subtitle}</p>
      <div className="mt-4 h-64">{children}</div>
    </div>
  );
}
