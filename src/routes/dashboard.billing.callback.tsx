import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";

export const Route = createFileRoute("/dashboard/billing/callback")({
  component: BillingCallbackPage,
  head: () => ({
    meta: [
      { title: "Processing subscription · BizPal" },
      { name: "description", content: "We're confirming your BizPal subscription payment." },
      { property: "og:title", content: "Processing subscription · BizPal" },
      { property: "og:description", content: "We're confirming your BizPal subscription payment." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
});

function BillingCallbackPage() {
  const navigate = useNavigate();

  useEffect(() => {
    const t = setTimeout(() => navigate({ to: "/dashboard/billing" }), 5000);
    return () => clearTimeout(t);
  }, [navigate]);

  return (
    <div className="mx-auto max-w-md rounded-xl border border-border bg-card p-8 text-center shadow-card">
      <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
      <h1 className="mt-4 text-lg font-semibold">Processing your subscription</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        We're confirming your payment. This only takes a moment — you'll be taken back to billing automatically.
      </p>
    </div>
  );
}
