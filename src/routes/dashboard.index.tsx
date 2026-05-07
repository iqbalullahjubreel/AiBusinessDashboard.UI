import { createFileRoute, Link } from "@tanstack/react-router";
import { kpis, activity, revenueSeries, recentFiles, aiUsageSeries } from "@/lib/mock-data";
import { Sparkles, ArrowUpRight, ArrowDownRight, Plus, Upload, MessageSquarePlus, FileText, X } from "lucide-react";
import { Area, AreaChart, Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from "recharts";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";

export const Route = createFileRoute("/dashboard/")({
  component: DashboardHome,
});

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

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">Good to see you back</h1>
          <p className="mt-1 text-sm text-muted-foreground">Here's what's happening across your business today.</p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline" size="sm"><Link to="/dashboard/files"><Upload className="mr-1.5 h-4 w-4" />Upload</Link></Button>
          <Button asChild size="sm" className="bg-gradient-primary shadow-glow hover:opacity-90"><Link to="/dashboard/chat"><MessageSquarePlus className="mr-1.5 h-4 w-4" />New chat</Link></Button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map((k) => {
          const positive = k.delta >= 0;
          return (
            <div key={k.label} className="group relative overflow-hidden rounded-xl border border-border bg-card p-5 shadow-card transition-all hover:-translate-y-0.5 hover:border-primary/30">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{k.label}</p>
              <div className="mt-2 flex items-end justify-between gap-3">
                <p className="text-2xl font-semibold tracking-tight">{k.value}</p>
                <div className={`flex items-center gap-0.5 rounded-full px-2 py-0.5 text-[11px] font-medium ${positive ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"}`}>
                  {positive ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                  {Math.abs(k.delta)}%
                </div>
              </div>
              <div className="mt-3 h-10 -mb-1 -mx-1">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={k.trend.map((v, i) => ({ i, v }))}>
                    <defs>
                      <linearGradient id={`g-${k.label}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="var(--color-primary)" stopOpacity={0.5} />
                        <stop offset="100%" stopColor="var(--color-primary)" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <Area type="monotone" dataKey="v" stroke="var(--color-primary)" strokeWidth={1.5} fill={`url(#g-${k.label})`} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {/* Revenue chart */}
        <div className="rounded-xl border border-border bg-card p-5 shadow-card lg:col-span-2">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold">Revenue overview</p>
              <p className="text-xs text-muted-foreground">Last 12 months</p>
            </div>
            <div className="flex gap-1 rounded-lg border border-border p-0.5 text-xs">
              {["12M", "6M", "3M"].map((p, i) => (
                <button key={p} className={`rounded-md px-2.5 py-1 ${i === 0 ? "bg-accent text-foreground" : "text-muted-foreground"}`}>{p}</button>
              ))}
            </div>
          </div>
          <div className="mt-4 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueSeries}>
                <defs>
                  <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--color-primary)" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="var(--color-primary)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="var(--color-border)" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="m" stroke="var(--color-muted-foreground)" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="var(--color-muted-foreground)" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `$${v / 1000}k`} />
                <Tooltip contentStyle={{ background: "var(--color-popover)", border: "1px solid var(--color-border)", borderRadius: 8, fontSize: 12 }} />
                <Area type="monotone" dataKey="revenue" stroke="var(--color-primary)" strokeWidth={2} fill="url(#rev)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* AI insight */}
        <div className="relative overflow-hidden rounded-xl border border-primary/20 bg-card p-5 shadow-card">
          <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-primary/20 blur-3xl" />
          <div className="relative">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-1 text-[11px] font-medium text-primary">
              <Sparkles className="h-3 w-3" /> AI insight
            </div>
            <p className="mt-3 text-sm leading-relaxed">
              Enterprise upgrades drove <span className="font-semibold text-foreground">41% of new ARR</span> this quarter. Your <span className="text-gradient-primary font-semibold">EMEA cohort</span> is up 34% — consider a Q2 expansion campaign.
            </p>
            <Button asChild size="sm" className="mt-4 bg-gradient-primary shadow-glow hover:opacity-90"><Link to="/dashboard/chat">Ask follow-up</Link></Button>
          </div>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {/* AI usage */}
        <div className="rounded-xl border border-border bg-card p-5 shadow-card lg:col-span-2">
          <p className="text-sm font-semibold">AI usage this week</p>
          <div className="mt-4 h-60">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={aiUsageSeries}>
                <CartesianGrid stroke="var(--color-border)" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="d" stroke="var(--color-muted-foreground)" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="var(--color-muted-foreground)" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ background: "var(--color-popover)", border: "1px solid var(--color-border)", borderRadius: 8, fontSize: 12 }} />
                <Bar dataKey="chat" stackId="a" fill="var(--color-chart-1)" radius={[0, 0, 0, 0]} />
                <Bar dataKey="summarize" stackId="a" fill="var(--color-chart-2)" />
                <Bar dataKey="files" stackId="a" fill="var(--color-chart-3)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Activity */}
        <div className="rounded-xl border border-border bg-card p-5 shadow-card">
          <p className="text-sm font-semibold">Activity</p>
          <ul className="mt-4 space-y-3">
            {activity.map((a) => (
              <li key={a.id} className="flex gap-3 text-sm">
                <div className="mt-0.5 h-7 w-7 shrink-0 rounded-full bg-gradient-primary text-center text-[11px] font-medium leading-7 text-primary-foreground">
                  {a.user.split(" ").map((p) => p[0]).slice(0, 2).join("")}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate"><span className="font-medium">{a.user}</span> <span className="text-muted-foreground">{a.action}</span> <span className="font-medium">{a.target}</span></p>
                  <p className="text-xs text-muted-foreground">{a.time}</p>
                </div>
              </li>
            ))}
          </ul>
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
            {recentFiles.map((f) => (
              <div key={f.id} className="flex items-center gap-3 py-3">
                <div className="grid h-9 w-9 place-items-center rounded-lg bg-accent text-accent-foreground"><FileText className="h-4 w-4" /></div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{f.name}</p>
                  <p className="text-xs text-muted-foreground">{(f.size / 1024).toFixed(0)} KB · {f.uploadedAt}</p>
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
            <DialogTitle className="text-2xl">Welcome to NovaAI</DialogTitle>
            <DialogDescription>Three quick things to know before you dive in.</DialogDescription>
          </DialogHeader>
          <ul className="space-y-3 py-2 text-sm">
            <li className="flex gap-3"><span className="grid h-6 w-6 place-items-center rounded-full bg-primary/10 text-xs font-semibold text-primary">1</span><div><p className="font-medium">Press ⌘K anywhere</p><p className="text-muted-foreground">to open the command palette and jump anywhere.</p></div></li>
            <li className="flex gap-3"><span className="grid h-6 w-6 place-items-center rounded-full bg-primary/10 text-xs font-semibold text-primary">2</span><div><p className="font-medium">Drop files into Files</p><p className="text-muted-foreground">PDFs, CSVs, docs — we'll summarize them.</p></div></li>
            <li className="flex gap-3"><span className="grid h-6 w-6 place-items-center rounded-full bg-primary/10 text-xs font-semibold text-primary">3</span><div><p className="font-medium">Ask the AI assistant</p><p className="text-muted-foreground">It knows your data. Try "what drove revenue?".</p></div></li>
          </ul>
          <DialogFooter>
            <Button onClick={closeOnboard} className="bg-gradient-primary shadow-glow hover:opacity-90">Get started <X className="ml-1 h-3 w-3 opacity-0" /></Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
