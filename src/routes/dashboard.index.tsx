import { createFileRoute, Link } from "@tanstack/react-router";
import { brand } from "@/lib/brand";
import { useQuery } from "@tanstack/react-query";
import { analyticsApi, filesApi, notificationsApi } from "@/services/api";
import { Sparkles, Plus, Upload, MessageSquarePlus, FileText, X, Bell, BarChart3 } from "lucide-react";
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from "recharts";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/empty-state";
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";

export const Route = createFileRoute("/dashboard/")({
  component: DashboardHome,
});

const fmtDate = (iso: string) => new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric" });
const fmtDateTime = (iso: string) => new Date(iso).toLocaleString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });

function DashboardHome() {
  const [onboardOpen, setOnboardOpen] = useState(false);
  useEffect(() => {
    if (!localStorage.getItem("onboarded")) {
      setOnboardOpen(true);
    }
  }, []);
  const closeOnboard = () => {
    localStorage.setItem("onboarded", "1");
    setOnboardOpen(false);
  };

  const analytics = useQuery({ queryKey: ["analytics", 7], queryFn: () => analyticsApi.getMine(7) });
  const files = useQuery({ queryKey: ["files"], queryFn: () => filesApi.list() });
  const notifications = useQuery({ queryKey: ["notifications"], queryFn: () => notificationsApi.list() });

  const series = analytics.data?.series ?? [];
  const recent = (files.data ?? []).slice(0, 5);
  const feed = (notifications.data ?? []).slice(0, 6);

  const kpis = [
    { label: "Chats (7d)", value: analytics.data?.totalChats },
    { label: "Files uploaded (7d)", value: analytics.data?.totalFiles },
    { label: "Summaries (7d)", value: analytics.data?.totalSummaries },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">Good to see you back</h1>
          <p className="mt-1 text-sm text-muted-foreground">Here's your activity from the last 7 days.</p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline" size="sm"><Link to="/dashboard/files"><Upload className="mr-1.5 h-4 w-4" />Upload</Link></Button>
          <Button asChild size="sm" className="bg-gradient-primary shadow-glow hover:opacity-90"><Link to="/dashboard/chat"><MessageSquarePlus className="mr-1.5 h-4 w-4" />New chat</Link></Button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid gap-3 sm:grid-cols-3">
        {kpis.map((k) => (
          <div key={k.label} className="rounded-xl border border-border bg-card p-5 shadow-card transition-all hover:-translate-y-0.5 hover:border-primary/30">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{k.label}</p>
            <p className="mt-2 text-2xl font-semibold tracking-tight">
              {analytics.isLoading ? "—" : (k.value ?? 0).toLocaleString()}
            </p>
          </div>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {/* Activity over time */}
        <div className="rounded-xl border border-border bg-card p-5 shadow-card lg:col-span-2">
          <p className="text-sm font-semibold">Activity this week</p>
          <p className="text-xs text-muted-foreground">Chats, uploads and summaries per day</p>
          <div className="mt-4 h-64">
            {analytics.isLoading ? (
              <p className="p-4 text-sm text-muted-foreground">Loading...</p>
            ) : series.length === 0 ? (
              <EmptyState icon={BarChart3} title="No activity yet" description="Start a chat or upload a file to see your trends here." />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={series}>
                  <CartesianGrid stroke="var(--color-border)" strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="date" tickFormatter={fmtDate} stroke="var(--color-muted-foreground)" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="var(--color-muted-foreground)" fontSize={11} tickLine={false} axisLine={false} allowDecimals={false} />
                  <Tooltip contentStyle={{ background: "var(--color-popover)", border: "1px solid var(--color-border)", borderRadius: 8, fontSize: 12 }} />
                  <Bar dataKey="chats" stackId="a" fill="var(--color-chart-1)" />
                  <Bar dataKey="filesUploaded" stackId="a" fill="var(--color-chart-2)" />
                  <Bar dataKey="summariesCreated" stackId="a" fill="var(--color-chart-3)" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Recent activity feed */}
        <div className="rounded-xl border border-border bg-card p-5 shadow-card">
          <p className="text-sm font-semibold">Recent activity</p>
          {notifications.isLoading ? (
            <p className="p-4 text-sm text-muted-foreground">Loading...</p>
          ) : feed.length === 0 ? (
            <EmptyState icon={Bell} title="Nothing yet" description="Updates about your account show up here." />
          ) : (
            <ul className="mt-4 space-y-3">
              {feed.map((n) => (
                <li key={n.id} className="flex gap-3 text-sm">
                  <div className="mt-1 h-2 w-2 shrink-0 rounded-full bg-primary" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">{n.title}</p>
                    <p className="truncate text-xs text-muted-foreground">{n.description}</p>
                    <p className="text-xs text-muted-foreground">{fmtDateTime(n.createdAt)}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Recent files + quick actions */}
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-xl border border-border bg-card p-5 shadow-card lg:col-span-2">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold">Recent uploads</p>
            <Link to="/dashboard/files" className="text-xs text-primary hover:underline">View all</Link>
          </div>
          <div className="mt-4 divide-y divide-border">
            {files.isLoading && <p className="p-4 text-sm text-muted-foreground">Loading...</p>}
            {!files.isLoading && recent.length === 0 && (
              <EmptyState icon={Upload} title="No uploads yet" description="Add a file from the Files page." />
            )}
            {recent.map((f) => (
              <div key={f.id} className="flex items-center gap-3 py-3">
                <div className="grid h-9 w-9 place-items-center rounded-lg bg-accent text-accent-foreground"><FileText className="h-4 w-4" /></div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{f.name}</p>
                  <p className="text-xs text-muted-foreground">{(f.size / 1024).toFixed(0)} KB · {fmtDateTime(f.uploadedAt)}</p>
                </div>
                <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium capitalize ${f.status === "ready" ? "bg-success/10 text-success" : f.status === "processing" ? "bg-warning/10 text-warning" : "bg-muted text-muted-foreground"}`}>{f.status}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card p-5 shadow-card">
          <p className="text-sm font-semibold">Quick actions</p>
          <div className="mt-4 grid grid-cols-2 gap-2">
            {[
              { i: MessageSquarePlus, l: "New chat", to: "/dashboard/chat" },
              { i: Upload, l: "Upload file", to: "/dashboard/files" },
              { i: Sparkles, l: "Summarize", to: "/dashboard/summaries" },
              { i: Plus, l: "Invite user", to: "/dashboard/admin" },
            ].map((q) => (
              <Link key={q.l} to={q.to} className="group flex flex-col items-start gap-2 rounded-lg border border-border bg-background/40 p-3 transition-all hover:border-primary/40 hover:bg-accent/40">
                <q.i className="h-4 w-4 text-primary transition-transform group-hover:scale-110" />
                <span className="text-xs font-medium">{q.l}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Onboarding modal */}
      <Dialog open={onboardOpen} onOpenChange={(v) => { if (!v) closeOnboard(); }}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <div className="mb-2 grid h-10 w-10 place-items-center rounded-xl bg-gradient-primary shadow-glow">
              <Sparkles className="h-5 w-5 text-primary-foreground" />
            </div>
            <DialogTitle className="text-2xl">Welcome to {brand.name}</DialogTitle>
            <DialogDescription>Three quick things to know before you dive in.</DialogDescription>
          </DialogHeader>
          <ul className="space-y-3 py-2 text-sm">
            <li className="flex gap-3"><span className="grid h-6 w-6 place-items-center rounded-full bg-primary/10 text-xs font-semibold text-primary">1</span><div><p className="font-medium">Press ⌘K anywhere</p><p className="text-muted-foreground">to open the command palette and jump anywhere.</p></div></li>
            <li className="flex gap-3"><span className="grid h-6 w-6 place-items-center rounded-full bg-primary/10 text-xs font-semibold text-primary">2</span><div><p className="font-medium">Drop files into Files</p><p className="text-muted-foreground">PDFs, CSVs, docs — we'll summarize them.</p></div></li>
            <li className="flex gap-3"><span className="grid h-6 w-6 place-items-center rounded-full bg-primary/10 text-xs font-semibold text-primary">3</span><div><p className="font-medium">Ask the AI assistant</p><p className="text-muted-foreground">It knows your data. Try "what changed this week?".</p></div></li>
          </ul>
          <DialogFooter>
            <Button onClick={closeOnboard} className="bg-gradient-primary shadow-glow hover:opacity-90">Get started <X className="ml-1 h-3 w-3 opacity-0" /></Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
