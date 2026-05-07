import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { summaries } from "@/lib/mock-data";
import ReactMarkdown from "react-markdown";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Sparkles, Copy, Download, Check, ChevronDown, ChevronUp } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/dashboard/summaries")({
  component: SummariesPage,
});

function SummariesPage() {
  const [q, setQ] = useState("");
  const [tag, setTag] = useState("all");
  const allTags = Array.from(new Set(summaries.flatMap((s) => s.tags)));
  const filtered = summaries.filter((s) =>
    (tag === "all" || s.tags.includes(tag)) &&
    (q === "" || s.title.toLowerCase().includes(q.toLowerCase()) || s.content.toLowerCase().includes(q.toLowerCase())),
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">AI Summaries</h1>
          <p className="mt-1 text-sm text-muted-foreground">Auto-generated executive briefings from your data and files.</p>
        </div>
        <Button className="bg-gradient-primary shadow-glow hover:opacity-90"><Sparkles className="mr-1.5 h-4 w-4" /> Generate new</Button>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search summaries..." className="pl-9" />
        </div>
        <Tabs value={tag} onValueChange={setTag}>
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            {allTags.map((t) => <TabsTrigger key={t} value={t} className="capitalize">{t}</TabsTrigger>)}
          </TabsList>
        </Tabs>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {filtered.map((s) => <SummaryCard key={s.id} s={s} />)}
        {filtered.length === 0 && (
          <div className="col-span-full rounded-xl border border-dashed border-border p-12 text-center text-sm text-muted-foreground">
            No summaries match your filters.
          </div>
        )}
      </div>
    </div>
  );
}

function SummaryCard({ s }: { s: typeof summaries[0] }) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    await navigator.clipboard.writeText(s.content);
    setCopied(true);
    toast.success("Copied");
    setTimeout(() => setCopied(false), 1500);
  };
  return (
    <div className="rounded-xl border border-border bg-card p-5 shadow-card transition-all hover:border-primary/30">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-base font-semibold">{s.title}</p>
          <p className="mt-0.5 text-xs text-muted-foreground">From {s.source} · {s.createdAt}</p>
        </div>
        <div className="flex shrink-0 gap-1">
          <Button size="icon" variant="ghost" onClick={copy}>{copied ? <Check className="h-4 w-4 text-success" /> : <Copy className="h-4 w-4" />}</Button>
          <Button size="icon" variant="ghost"><Download className="h-4 w-4" /></Button>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {s.highlights.map((h) => (
          <span key={h} className="rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-medium text-primary">{h}</span>
        ))}
      </div>

      <div className={cn("prose prose-sm prose-invert mt-4 max-w-none text-sm text-muted-foreground", !open && "line-clamp-3")}>
        <ReactMarkdown>{s.content}</ReactMarkdown>
      </div>

      <button onClick={() => setOpen((o) => !o)} className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline">
        {open ? <>Show less <ChevronUp className="h-3 w-3" /></> : <>Show more <ChevronDown className="h-3 w-3" /></>}
      </button>
    </div>
  );
}
