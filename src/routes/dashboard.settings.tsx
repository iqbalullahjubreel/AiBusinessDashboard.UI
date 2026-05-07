import { createFileRoute } from "@tanstack/react-router";
import { useAuth } from "@/contexts/auth-context";
import { useTheme } from "@/contexts/theme-context";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Sun, Moon, Monitor, Eye, EyeOff, Copy } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/dashboard/settings")({
  component: SettingsPage,
});

function SettingsPage() {
  const { user } = useAuth();
  const { theme, setTheme } = useTheme();
  const [showKey, setShowKey] = useState(false);
  const apiKey = "nova_sk_live_8f3a2c1e9b4d5f6789abcdef01234567";
  const copy = async () => { await navigator.clipboard.writeText(apiKey); toast.success("API key copied"); };

  if (!user) return null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">Manage your workspace preferences.</p>
      </div>

      <Tabs defaultValue="profile">
        <TabsList>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="appearance">Appearance</TabsTrigger>
          <TabsTrigger value="api">API & Billing</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="mt-4">
          <Card title="Profile" desc="Update your account details.">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Full name" defaultValue={user.name} />
              <Field label="Email" type="email" defaultValue={user.email} />
              <Field label="Job title" placeholder="Head of Growth" />
              <Field label="Company" placeholder="NovaAI Inc." />
            </div>
            <Button className="mt-5 bg-gradient-primary shadow-glow hover:opacity-90">Save changes</Button>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="mt-4">
          <Card title="Change password" desc="Use a strong, unique password.">
            <div className="grid max-w-md gap-4">
              <Field label="Current password" type="password" />
              <Field label="New password" type="password" />
              <Field label="Confirm new password" type="password" />
            </div>
            <Button className="mt-5">Update password</Button>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="mt-4">
          <Card title="Notifications" desc="Choose what you want to be notified about.">
            <div className="divide-y divide-border">
              {[
                { l: "Email digests", d: "Weekly summary of your workspace" },
                { l: "AI insights", d: "Get notified when new insights are generated" },
                { l: "Mentions", d: "When teammates mention you" },
                { l: "Billing updates", d: "Invoices and plan changes" },
              ].map((n, i) => (
                <div key={n.l} className="flex items-center justify-between py-3">
                  <div><p className="text-sm font-medium">{n.l}</p><p className="text-xs text-muted-foreground">{n.d}</p></div>
                  <Switch defaultChecked={i !== 2} />
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="appearance" className="mt-4">
          <Card title="Theme" desc="Customize how NovaAI looks for you.">
            <div className="grid max-w-md grid-cols-3 gap-2">
              {([
                { k: "light", l: "Light", i: Sun },
                { k: "dark", l: "Dark", i: Moon },
                { k: "system", l: "System", i: Monitor },
              ] as const).map((t) => (
                <button
                  key={t.k}
                  onClick={() => t.k !== "system" && setTheme(t.k)}
                  className={cn(
                    "flex flex-col items-center gap-2 rounded-xl border p-4 text-sm transition-all",
                    theme === t.k && t.k !== "system" ? "border-primary bg-primary/5 shadow-glow" : "border-border hover:border-primary/40",
                  )}
                >
                  <t.i className="h-5 w-5" />
                  {t.l}
                </button>
              ))}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="api" className="mt-4 space-y-4">
          <Card title="API key" desc="Use this key to authenticate API requests.">
            <div className="flex max-w-xl items-center gap-2 rounded-lg border border-border bg-background/40 p-2">
              <code className="flex-1 truncate font-mono text-xs">{showKey ? apiKey : "•".repeat(apiKey.length)}</code>
              <Button size="icon" variant="ghost" onClick={() => setShowKey((s) => !s)}>{showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</Button>
              <Button size="icon" variant="ghost" onClick={copy}><Copy className="h-4 w-4" /></Button>
            </div>
            <Button variant="outline" className="mt-4">Regenerate key</Button>
          </Card>
          <Card title="Billing" desc="You're on the Pro plan.">
            <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-border bg-background/40 p-4">
              <div><p className="font-semibold">Pro · $49/mo</p><p className="text-xs text-muted-foreground">Renews May 28, 2026</p></div>
              <Button variant="outline">Manage plan</Button>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function Card({ title, desc, children }: { title: string; desc: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-border bg-card p-5 shadow-card">
      <p className="text-sm font-semibold">{title}</p>
      <p className="text-xs text-muted-foreground">{desc}</p>
      <div className="mt-4">{children}</div>
    </div>
  );
}

function Field({ label, ...props }: { label: string } & React.ComponentProps<typeof Input>) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      <Input {...props} />
    </div>
  );
}
