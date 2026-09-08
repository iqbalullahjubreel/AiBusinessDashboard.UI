import { createFileRoute } from "@tanstack/react-router";
import { Bar, BarChart, CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Button } from "@/components/ui/button";
import { Calendar, Download, MessageSquare, FileText, ScrollText, BarChart3 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import { analyticsApi } from "@/services/api";
import { useState } from "react";
import { EmptyState } from "@/components/empty-state";

export const Route = createFileRoute("/dashboard/analytics")({
  component: AnalyticsPage,
  head: () => ({
    meta: [
      { title: "Analytics · BizPal" },
      { name: "description", content: "Track your AI chats, file uploads and summaries over time." },
      { property: "og:title", content: "Analytics · BizPal" },
      { property: "og:description", content: "Track your AI chats, file uploads and summaries over time." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
});

const tooltipStyle = { background: "var(--color-popover)", border: "1px solid var(--color-border)", borderRadius: 8, fontSize: 12 };

function AnalyticsPage() {
  const [days, setDays] = useState("30");
  const { data, isLoading } = useQuery({
    queryKey: ["analytics", days],
    queryFn: () => analyticsApi.getMine(Number(days)),
  });

  const series = (data?.series ?? []).map((p) => ({
    ...p,
    label: new Date(p.date).toLocaleDateString(undefined, { month: "short", day: "numeric" }),
  }));

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">Analytics</h1>
          <p className="mt-1 text-sm text-muted-foreground">Your activity across chats, files, and summaries.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Select value={days} onValueChange={setDays}>
            <SelectTrigger className="w-[180px]"><Calendar className="mr-2 h-4 w-4" /><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="90">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm"><Download className="mr-1.5 h-4 w-4" /> Export</Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard icon={MessageSquare} label="Total chats" value={data?.totalChats} loading={isLoading} />
        <StatCard icon={FileText} label="Files uploaded" value={data?.totalFiles} loading={isLoading} />
        <StatCard icon={ScrollText} label="Summaries created" value={data?.totalSummaries} loading={isLoading} />
      </div>

      {series.length === 0 && !isLoading ? (
        <div className="rounded-xl border border-border bg-card shadow-card">
          <EmptyState icon={BarChart3} title="No activity yet" description="Once you start chatting, uploading files or creating summaries, your trends appear here." />
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          <ChartCard title="Activity over time" subtitle="Daily usage across features">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={series}>
                <CartesianGrid stroke="var(--color-border)" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="label" stroke="var(--color-muted-foreground)" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="var(--color-muted-foreground)" fontSize={11} tickLine={false} axisLine={false} allowDecimals={false} />
                <Tooltip contentStyle={tooltipStyle} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Line type="monotone" name="Chats" dataKey="chats" stroke="var(--color-primary)" strokeWidth={2} dot={false} />
                <Line type="monotone" name="Files" dataKey="filesUploaded" stroke="var(--color-chart-2)" strokeWidth={2} dot={false} />
                <Line type="monotone" name="Summaries" dataKey="summariesCreated" stroke="var(--color-chart-3)" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="Daily breakdown" subtitle="Chats, uploads and summaries per day">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={series}>
                <CartesianGrid stroke="var(--color-border)" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="label" stroke="var(--color-muted-foreground)" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="var(--color-muted-foreground)" fontSize={11} tickLine={false} axisLine={false} allowDecimals={false} />
                <Tooltip contentStyle={tooltipStyle} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar name="Chats" dataKey="chats" fill="var(--color-chart-1)" radius={[4, 4, 0, 0]} />
                <Bar name="Files" dataKey="filesUploaded" fill="var(--color-chart-2)" radius={[4, 4, 0, 0]} />
                <Bar name="Summaries" dataKey="summariesCreated" fill="var(--color-chart-3)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>
      )}
    </div>
  );
}

function StatCard({ icon: Icon, label, value, loading }: { icon: React.ElementType; label: string; value?: number; loading: boolean }) {
  return (
    <div className="rounded-xl border border-border bg-card p-5 shadow-card">
      <div className="flex items-center justify-between">
        <p className="text-xs uppercase tracking-wider text-muted-foreground">{label}</p>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </div>
      <p className="mt-2 text-2xl font-semibold">{loading ? "—" : (value ?? 0).toLocaleString()}</p>
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
