import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiKeysApi } from "@/services/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { EmptyState } from "@/components/empty-state";
import { Copy, KeyRound, Plus, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

const fmt = (iso?: string | null) => (iso ? new Date(iso).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" }) : "Never");

export function ApiKeysCard() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ["api-keys"], queryFn: () => apiKeysApi.list() });
  const [nameOpen, setNameOpen] = useState(false);
  const [name, setName] = useState("");
  const [plainKey, setPlainKey] = useState<string | null>(null);

  const create = useMutation({
    mutationFn: (n: string) => apiKeysApi.create(n),
    onSuccess: (res) => {
      setNameOpen(false);
      setName("");
      setPlainKey(res.plainKey);
      qc.invalidateQueries({ queryKey: ["api-keys"] });
    },
    onError: (e: Error) => toast.error(e.message || "Could not create key"),
  });

  const revoke = useMutation({
    mutationFn: (id: string) => apiKeysApi.revoke(id),
    onSuccess: () => { toast.success("Key revoked"); qc.invalidateQueries({ queryKey: ["api-keys"] }); },
    onError: (e: Error) => toast.error(e.message || "Could not revoke key"),
  });

  const keys = data ?? [];

  return (
    <div className="rounded-xl border border-border bg-card shadow-card">
      <div className="flex items-center justify-between border-b border-border p-4">
        <div>
          <p className="text-sm font-semibold">API keys</p>
          <p className="text-xs text-muted-foreground">Use these keys to authenticate API requests.</p>
        </div>
        <Button size="sm" className="bg-gradient-primary shadow-glow hover:opacity-90" onClick={() => setNameOpen(true)}>
          <Plus className="mr-1.5 h-4 w-4" /> Generate new key
        </Button>
      </div>

      {isLoading ? (
        <p className="p-4 text-sm text-muted-foreground">Loading...</p>
      ) : keys.length === 0 ? (
        <EmptyState icon={KeyRound} title="No API keys yet" description="Generate a key to start using the API." />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs uppercase tracking-wider text-muted-foreground">
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">Key</th>
                <th className="px-4 py-3 font-medium">Created</th>
                <th className="px-4 py-3 font-medium">Last used</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {keys.map((k) => (
                <tr key={k.id} className="transition-colors hover:bg-accent/30">
                  <td className="px-4 py-3 font-medium">{k.name}</td>
                  <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{k.prefix}…</td>
                  <td className="px-4 py-3 text-muted-foreground">{fmt(k.createdAt)}</td>
                  <td className="px-4 py-3 text-muted-foreground">{fmt(k.lastUsedAt)}</td>
                  <td className="px-4 py-3 text-right">
                    <Button size="sm" variant="outline" disabled={revoke.isPending} onClick={() => revoke.mutate(k.id)}>Revoke</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Name prompt */}
      <Dialog open={nameOpen} onOpenChange={setNameOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Generate a new API key</DialogTitle>
            <DialogDescription>Give the key a name so you can recognise it later.</DialogDescription>
          </DialogHeader>
          <div className="space-y-1.5">
            <Label htmlFor="key-name">Key name</Label>
            <Input id="key-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Production server" />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setNameOpen(false)}>Cancel</Button>
            <Button
              className="bg-gradient-primary hover:opacity-90"
              disabled={!name.trim() || create.isPending}
              onClick={() => create.mutate(name.trim())}
            >
              {create.isPending ? "Generating..." : "Generate key"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* One-time key reveal */}
      <Dialog open={!!plainKey} onOpenChange={(o) => { if (!o) setPlainKey(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Your new API key</DialogTitle>
            <DialogDescription className="flex items-start gap-2 text-warning">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
              Copy this now — you won't be able to see it again.
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center gap-2 rounded-lg border border-border bg-background/40 p-2">
            <code className="flex-1 break-all font-mono text-xs">{plainKey}</code>
            <Button
              size="icon"
              variant="ghost"
              aria-label="Copy key"
              onClick={async () => { if (plainKey) { await navigator.clipboard.writeText(plainKey); toast.success("API key copied"); } }}
            >
              <Copy className="h-4 w-4" />
            </Button>
          </div>
          <DialogFooter>
            <Button onClick={() => setPlainKey(null)}>Done</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
