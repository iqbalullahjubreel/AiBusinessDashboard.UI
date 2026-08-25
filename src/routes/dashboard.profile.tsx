import { createFileRoute } from "@tanstack/react-router";
import { useAuth } from "@/contexts/auth-context";
import { Button } from "@/components/ui/button";
import { Camera, Mail, Shield } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/dashboard/profile")({
  component: ProfilePage,
});

function ProfilePage() {
  const { user } = useAuth();
  if (!user) return null;
  const parsed = new Date(user.createdAt);
  const memberSince = Number.isNaN(parsed.getTime())
    ? "—"
    : parsed.toLocaleDateString(undefined, { month: "long", year: "numeric" });
  return (
    <div className="space-y-6">
      <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-card">
        <div className="h-32 bg-gradient-primary" />
        <div className="-mt-12 px-6 pb-6">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div className="flex items-end gap-4">
              <div className="relative grid h-24 w-24 place-items-center rounded-2xl border-4 border-background bg-card text-2xl font-semibold shadow-card">
                {user.name.split(" ").map(p => p[0]).slice(0, 2).join("")}
                <button className="absolute bottom-1 right-1 grid h-7 w-7 place-items-center rounded-full bg-primary text-primary-foreground shadow-glow"><Camera className="h-3.5 w-3.5" /></button>
              </div>
              <div className="pb-2">
                <h1 className="text-2xl font-semibold tracking-tight">{user.name}</h1>
                <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
                  <Mail className="h-3.5 w-3.5" /> {user.email}
                  <Badge variant="secondary" className="ml-1 capitalize"><Shield className="mr-1 h-3 w-3" />{user.role}</Badge>
                </div>
              </div>
            </div>
            <Button variant="outline">Edit profile</Button>
          </div>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {[
          { l: "Total chats", v: "0" },
          { l: "Files uploaded", v: "0" },
          { l: "Summaries created", v: "0" },
        ].map((s) => (
          <div key={s.l} className="rounded-xl border border-border bg-card p-5 shadow-card">
            <p className="text-xs uppercase text-muted-foreground">{s.l}</p>
            <p className="mt-2 text-2xl font-semibold">{s.v}</p>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-border bg-card p-5 shadow-card">
        <p className="text-sm font-semibold">About</p>
        <p className="mt-2 text-sm text-muted-foreground">No bio yet.</p>
        <p className="mt-2 text-sm text-muted-foreground">Member since {memberSince}</p>
      </div>
    </div>
  );
}
