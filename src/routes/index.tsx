import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Sparkles, BarChart3, FileText, ScrollText, Shield, Zap, Brain, Workflow, Github } from "lucide-react";
import { Button } from "@/components/ui/button";
import { brand } from "@/lib/brand";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: brand.landingTitle },
      { name: "description", content: brand.landingDescription },
      { property: "og:title", content: brand.landingTitle },
      { property: "og:description", content: brand.landingDescription },
    ],
  }),
  component: Landing,
});

function Landing() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-background text-foreground">
      <div className="pointer-events-none absolute inset-0 bg-gradient-mesh" aria-hidden />

      {/* Nav */}
      <header className="relative z-10 mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
        <Link to="/" className="flex items-center gap-2">
          <div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-primary shadow-glow">
            <Sparkles className="h-4.5 w-4.5 text-primary-foreground" />
          </div>
          <span className="text-lg font-semibold tracking-tight">{brand.namePrefix}<span className="text-gradient-primary">{brand.nameSuffix}</span></span>
        </Link>
        <nav className="hidden items-center gap-8 md:flex">
          <a href="#features" className="text-sm text-muted-foreground transition-colors hover:text-foreground">Features</a>
          <a href="#showcase" className="text-sm text-muted-foreground transition-colors hover:text-foreground">Showcase</a>
          <a href="#pricing" className="text-sm text-muted-foreground transition-colors hover:text-foreground">Pricing</a>
        </nav>
        <div className="flex items-center gap-2">
          <Link to="/login" className="hidden text-sm text-muted-foreground transition-colors hover:text-foreground md:block">Sign in</Link>
          <Button asChild size="sm" className="bg-gradient-primary shadow-glow hover:opacity-90">
            <Link to="/register">Get started</Link>
          </Button>
        </div>
      </header>

      {/* Hero */}
      <section className="relative z-10 mx-auto max-w-7xl px-6 pb-20 pt-16 md:pt-28">
        <div className="mx-auto max-w-3xl text-center">
          <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-border bg-card/40 px-3 py-1 text-xs backdrop-blur">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary" />
            <span className="text-muted-foreground">v2.0 · AI Copilot now in public beta</span>
          </div>
          <h1 className="mt-6 text-balance text-5xl font-semibold tracking-tight md:text-7xl">
            The dashboard your team
            <br />
            <span className="text-gradient-primary">actually opens.</span>
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-pretty text-base text-muted-foreground md:text-lg">
            {brand.name} brings analytics, file intelligence, and an always-on assistant into one premium workspace —
            so your team spends less time digging and more time deciding.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Button asChild size="lg" className="bg-gradient-primary shadow-glow hover:opacity-90">
              <Link to="/register">Start free trial <ArrowRight className="ml-1 h-4 w-4" /></Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link to="/dashboard">Live demo</Link>
            </Button>
          </div>
        </div>

        {/* Hero visual */}
        <div id="showcase" className="relative mx-auto mt-16 max-w-6xl">
          <div className="absolute inset-x-0 -top-16 -z-10 h-64 rounded-full bg-primary/30 blur-3xl" />
          <div className="overflow-hidden rounded-2xl border border-border bg-card/60 shadow-card backdrop-blur-xl">
            <div className="flex items-center gap-1.5 border-b border-border px-4 py-2.5">
              <span className="h-2.5 w-2.5 rounded-full bg-destructive/60" />
              <span className="h-2.5 w-2.5 rounded-full bg-warning/60" />
              <span className="h-2.5 w-2.5 rounded-full bg-success/60" />
            </div>
            <div className="grid gap-3 p-4 md:grid-cols-4">
              {[
                { l: "Revenue", v: "$284k", d: "+12.4%" },
                { l: "Active Users", v: "12,438", d: "+8.2%" },
                { l: "AI Requests", v: "1.24M", d: "+24.1%" },
                { l: "Conversion", v: "4.83%", d: "-1.3%" },
              ].map((k) => (
                <div key={k.l} className="rounded-xl border border-border bg-background/40 p-4">
                  <p className="text-xs text-muted-foreground">{k.l}</p>
                  <p className="mt-1 text-2xl font-semibold">{k.v}</p>
                  <p className="mt-1 text-xs text-success">{k.d}</p>
                </div>
              ))}
              <div className="md:col-span-3 rounded-xl border border-border bg-background/40 p-4">
                <p className="text-sm font-medium">Revenue · last 12 months</p>
                <div className="mt-4 flex h-32 items-end gap-2">
                  {[18, 22, 27, 24, 31, 37, 41, 39, 47, 52, 58, 64].map((h, i) => (
                    <div key={i} className="flex-1 rounded-t bg-gradient-primary" style={{ height: `${h * 1.5}%` }} />
                  ))}
                </div>
              </div>
              <div className="rounded-xl border border-border bg-background/40 p-4">
                <p className="text-sm font-medium">AI insight</p>
                <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                  Enterprise upgrades drove <span className="text-foreground">41% of new ARR</span> this quarter — strongest growth lever.
                </p>
                <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2 py-1 text-[10px] font-medium text-primary">
                  <Sparkles className="h-3 w-3" /> AI generated
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="relative z-10 mx-auto max-w-7xl px-6 py-24">
        <div className="max-w-2xl">
          <p className="text-sm font-medium text-primary">Everything in one place</p>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight md:text-4xl">A workspace built for AI-first teams.</h2>
          <p className="mt-3 text-muted-foreground">Replace five tools. Skip the integrations. Ship faster.</p>
        </div>

        <div className="mt-12 grid gap-4 md:grid-cols-3">
          {[
            { i: BarChart3, t: "Live Analytics", d: "Beautiful, real-time charts powered by your data — no SQL required." },
            { i: Brain, t: "AI Assistant", d: "Ask anything across your business. Streaming answers, file context, code blocks." },
            { i: FileText, t: "File Intelligence", d: "Drop a PDF, CSV, or doc. Get structured summaries and key insights instantly." },
            { i: ScrollText, t: "Smart Summaries", d: "Auto-generated executive briefings. Share, export, and search across them." },
            { i: Shield, t: "Admin Controls", d: "Roles, permissions, audit logs, and feature flags — built in." },
            { i: Workflow, t: "API-Ready", d: "Drop-in for ASP.NET Core, Node, or any backend. Swap mocks with one env var." },
          ].map((f) => (
            <div key={f.t} className="group relative overflow-hidden rounded-2xl border border-border bg-card/40 p-6 backdrop-blur-xl transition-all hover:-translate-y-0.5 hover:shadow-glow">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-primary shadow-glow">
                <f.i className="h-5 w-5 text-primary-foreground" />
              </div>
              <h3 className="mt-4 text-base font-semibold">{f.t}</h3>
              <p className="mt-1.5 text-sm text-muted-foreground">{f.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="relative z-10 mx-auto max-w-7xl px-6 py-20">
        <div className="text-center">
          <p className="text-sm font-medium text-primary">Pricing</p>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight md:text-4xl">Simple, transparent pricing.</h2>
        </div>
        <div className="mx-auto mt-12 grid max-w-5xl gap-4 md:grid-cols-3">
          {[
            { name: "Starter", price: "$19", desc: "For individuals", features: ["5 seats", "Basic analytics", "100 AI requests/mo"] },
            { name: "Pro", price: "$49", desc: "For growing teams", features: ["20 seats", "Advanced analytics", "10k AI requests", "File intelligence"], featured: true },
            { name: "Scale", price: "$149", desc: "For organizations", features: ["Unlimited seats", "Custom roles", "Unlimited AI", "Priority support"] },
          ].map((p) => (
            <div key={p.name} className={`relative rounded-2xl border p-6 ${p.featured ? "border-primary/40 bg-card/80 shadow-glow" : "border-border bg-card/40"} backdrop-blur-xl`}>
              {p.featured && <span className="absolute -top-2.5 left-6 rounded-full bg-gradient-primary px-2.5 py-0.5 text-[10px] font-semibold text-primary-foreground">Most popular</span>}
              <p className="text-sm font-medium">{p.name}</p>
              <p className="mt-3"><span className="text-4xl font-semibold">{p.price}</span><span className="text-muted-foreground">/mo</span></p>
              <p className="mt-1 text-sm text-muted-foreground">{p.desc}</p>
              <ul className="mt-5 space-y-2 text-sm">
                {p.features.map((f) => (
                  <li key={f} className="flex items-center gap-2"><Zap className="h-3.5 w-3.5 text-primary" /> {f}</li>
                ))}
              </ul>
              <Button asChild className={`mt-6 w-full ${p.featured ? "bg-gradient-primary" : ""}`} variant={p.featured ? "default" : "outline"}>
                <Link to="/register">Choose {p.name}</Link>
              </Button>
            </div>
          ))}
        </div>
      </section>

      <footer className="relative z-10 mx-auto max-w-7xl border-t border-border px-6 py-8">
        <div className="flex flex-wrap items-center justify-between gap-4 text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} {brand.name}. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <a href="#" className="hover:text-foreground"><Github className="h-4 w-4" /></a>
            <a href="#" className="hover:text-foreground">Privacy</a>
            <a href="#" className="hover:text-foreground">Terms</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
