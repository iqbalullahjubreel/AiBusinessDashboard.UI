import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { brand } from "@/lib/brand";
import { Sparkles, ArrowLeft } from "lucide-react";

export function AuthShell({ title, subtitle, children, footer }: {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <div className="relative grid min-h-screen lg:grid-cols-2">
      <div className="pointer-events-none absolute inset-0 bg-gradient-mesh opacity-70 lg:hidden" aria-hidden />

      {/* Form */}
      <div className="flex flex-col px-6 py-8 md:px-12">
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground">
          <ArrowLeft className="h-3.5 w-3.5" /> Back home
        </Link>
        <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center">
          <div className="mb-8 flex items-center gap-2">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-primary shadow-glow">
              <Sparkles className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="text-lg font-semibold">Nova<span className="text-gradient-primary">AI</span></span>
          </div>
          <h1 className="text-3xl font-semibold tracking-tight">{title}</h1>
          <p className="mt-2 text-sm text-muted-foreground">{subtitle}</p>
          <div className="mt-8">{children}</div>
          {footer && <div className="mt-6 text-sm text-muted-foreground">{footer}</div>}
        </div>
      </div>

      {/* Visual */}
      <div className="relative hidden overflow-hidden bg-card lg:block">
        <div className="absolute inset-0 bg-gradient-mesh" />
        <div className="absolute inset-0 flex items-center justify-center p-12">
          <div className="w-full max-w-md rounded-2xl border border-border bg-card/60 p-6 shadow-card backdrop-blur-xl">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              <span>{brand.name} Insight</span>
            </div>
            <p className="mt-4 text-lg font-medium leading-relaxed">
              "Enterprise upgrades drove <span className="text-gradient-primary font-semibold">41% of new ARR</span> this quarter.
              Recommend doubling down on the upgrade cohort with a targeted Q2 campaign."
            </p>
            <div className="mt-6 grid grid-cols-3 gap-3">
              {[{ l: "ARR", v: "+41%" }, { l: "Churn", v: "1.8%" }, { l: "NPS", v: "62" }].map((s) => (
                <div key={s.l} className="rounded-lg border border-border bg-background/40 p-3">
                  <p className="text-[10px] text-muted-foreground">{s.l}</p>
                  <p className="mt-0.5 text-base font-semibold">{s.v}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
