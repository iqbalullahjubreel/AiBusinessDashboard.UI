import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { subscriptionApi } from "@/services/api";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/empty-state";
import { Check, CreditCard, Receipt } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/dashboard/billing")({
  component: BillingPage,
  head: () => ({
    meta: [
      { title: "Billing & plans · BizPal" },
      { name: "description", content: "Manage your BizPal plan, usage and payment history." },
      { property: "og:title", content: "Billing & plans · BizPal" },
      { property: "og:description", content: "Manage your BizPal plan, usage and payment history." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
});

const naira = (kobo: number) =>
  new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 }).format(kobo / 100);

const date = (iso?: string | null) => (iso ? new Date(iso).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" }) : "—");

function BillingPage() {
  const qc = useQueryClient();
  const plans = useQuery({ queryKey: ["plans"], queryFn: () => subscriptionApi.getPlans() });
  const mine = useQuery({ queryKey: ["subscription"], queryFn: () => subscriptionApi.getMine() });
  const history = useQuery({ queryKey: ["billing-history"], queryFn: () => subscriptionApi.getBillingHistory() });

  const subscribe = useMutation({
    mutationFn: (planName: string) => subscriptionApi.initialize(planName),
    onSuccess: (res) => {
      if (res?.authorizationUrl) {
        window.location.href = res.authorizationUrl;
      } else {
        toast.success("You're all set — no payment needed for this plan.");
        qc.invalidateQueries({ queryKey: ["subscription"] });
      }
    },
    onError: (e: Error) => toast.error(e.message || "Could not start checkout"),
  });

  const sub = mine.data;
  const pct = sub && sub.monthlyQuota > 0 ? Math.min(100, Math.round((sub.usedThisPeriod / sub.monthlyQuota) * 100)) : 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">Billing</h1>
        <p className="mt-1 text-sm text-muted-foreground">Manage your plan, usage, and payment history.</p>
      </div>

      {/* Current plan */}
      <div className="rounded-xl border border-border bg-card p-5 shadow-card">
        <p className="text-sm font-semibold">Current plan</p>
        {mine.isLoading ? (
          <p className="mt-3 text-sm text-muted-foreground">Loading...</p>
        ) : !sub ? (
          <EmptyState icon={CreditCard} title="No active plan" description="Pick a plan below to get started." />
        ) : (
          <div className="mt-4 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <p className="text-lg font-semibold">{sub.planName}</p>
                <Badge variant="secondary" className="capitalize">{sub.status}</Badge>
              </div>
              <p className="text-xs text-muted-foreground">Renews {date(sub.currentPeriodEnd)}</p>
            </div>
            <div>
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{sub.usedThisPeriod.toLocaleString()} of {sub.monthlyQuota.toLocaleString()} requests used</span>
                <span>{pct}%</span>
              </div>
              <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-accent">
                <div className="h-full bg-gradient-primary" style={{ width: `${pct}%` }} />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Plans */}
      <div>
        <p className="mb-3 text-sm font-semibold">Available plans</p>
        {plans.isLoading ? (
          <p className="text-sm text-muted-foreground">Loading plans...</p>
        ) : (plans.data ?? []).length === 0 ? (
          <div className="rounded-xl border border-border bg-card shadow-card">
            <EmptyState title="No plans available" />
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {(plans.data ?? []).map((p) => {
              const current = sub?.planName === p.name;
              return (
                <div key={p.name} className={cn("rounded-xl border bg-card p-5 shadow-card", current ? "border-primary shadow-glow" : "border-border")}>
                  <div className="flex items-center justify-between">
                    <p className="font-semibold">{p.name}</p>
                    {current && <Badge variant="secondary">Current</Badge>}
                  </div>
                  <p className="mt-3 text-2xl font-semibold">
                    {p.priceNGN === 0 ? "Free" : new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 }).format(p.priceNGN)}
                    {p.priceNGN > 0 && <span className="text-sm font-normal text-muted-foreground">/mo</span>}
                  </p>
                  <p className="mt-2 flex items-center gap-1.5 text-sm text-muted-foreground">
                    <Check className="h-4 w-4 text-primary" /> {p.monthlyQuota.toLocaleString()} AI requests / month
                  </p>
                  <Button
                    className="mt-5 w-full bg-gradient-primary shadow-glow hover:opacity-90"
                    disabled={current || subscribe.isPending}
                    onClick={() => subscribe.mutate(p.name)}
                  >
                    {current ? "Current plan" : "Subscribe"}
                  </Button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* History */}
      <div className="rounded-xl border border-border bg-card shadow-card">
        <div className="border-b border-border p-4">
          <p className="text-sm font-semibold">Billing history</p>
        </div>
        {history.isLoading ? (
          <p className="p-4 text-sm text-muted-foreground">Loading...</p>
        ) : (history.data ?? []).length === 0 ? (
          <EmptyState icon={Receipt} title="No payments yet" description="Your invoices will appear here after your first payment." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs uppercase tracking-wider text-muted-foreground">
                  <th className="px-4 py-3 font-medium">Reference</th>
                  <th className="px-4 py-3 font-medium">Amount</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Paid</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {(history.data ?? []).map((r) => (
                  <tr key={r.id ?? r.reference} className="transition-colors hover:bg-accent/30">
                    <td className="px-4 py-3 font-mono text-xs">{r.reference}</td>
                    <td className="px-4 py-3">{naira(r.amountKobo)}</td>
                    <td className="px-4 py-3"><Badge variant="secondary" className="capitalize">{r.status}</Badge></td>
                    <td className="px-4 py-3 text-muted-foreground">{date(r.paidAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
