import { createFileRoute } from "@tanstack/react-router";
import { brand } from "@/lib/brand";
import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { aiApi } from "@/services/api";
import { aiPromptSuggestions } from "@/lib/mock-data";
import type { ChatMessage, Conversation } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Sparkles, Send, Plus, Copy, Paperclip, Check, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/dashboard/chat")({
  component: ChatPage,
});

const conversationsKey = ["conversations"] as const;

function ChatPage() {
  const qc = useQueryClient();
  const [activeId, setActiveId] = useState<string>("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const { data: convs = [] } = useQuery({
    queryKey: conversationsKey,
    queryFn: () => aiApi.listConversations(),
  });

  // Select the first real conversation once the list loads.
  useEffect(() => {
    if (!activeId && convs.length > 0) setActiveId(convs[0].id);
  }, [convs, activeId]);

  // Load real message history whenever the active conversation changes.
  useEffect(() => {
    if (!activeId) {
      setMessages([]);
      return;
    }
    let cancelled = false;
    setMessages([]);
    aiApi.getConversation(activeId).then((c) => {
      if (!cancelled) setMessages(c?.messages ?? []);
    });
    return () => {
      cancelled = true;
    };
  }, [activeId]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages.length, streaming]);

  const active = convs.find((c) => c.id === activeId);

  const send = async (text: string) => {
    if (!text.trim() || streaming) return;
    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: text,
      createdAt: new Date().toISOString(),
    };
    const isNewEmptyConversation = messages.length === 0;
    setMessages((m) => [...m, userMsg]);
    setInput("");
    setStreaming(true);

    const assistantId = crypto.randomUUID();
    setMessages((m) => [
      ...m,
      { id: assistantId, role: "assistant", content: "", createdAt: new Date().toISOString() },
    ]);

    try {
      await aiApi.streamChat({
        message: text,
        // A brand-new, empty conversation has no real backend id yet.
        conversationId: isNewEmptyConversation ? undefined : activeId,
        onMeta: (meta) => {
          if (meta.conversationId && meta.conversationId !== activeId) {
            setActiveId(meta.conversationId);
            qc.invalidateQueries({ queryKey: conversationsKey });
          }
        },
        onChunk: (chunk) => {
          setMessages((m) =>
            m.map((msg) => (msg.id === assistantId ? { ...msg, content: msg.content + chunk } : msg)),
          );
        },
      });
      qc.invalidateQueries({ queryKey: conversationsKey });
    } catch {
      setMessages((m) => m.filter((msg) => msg.id !== assistantId));
      toast.error("Couldn't reach the assistant. Please try again.");
    } finally {
      setStreaming(false);
    }
  };

  const newChat = async () => {
    try {
      const conv: Conversation = await aiApi.createConversation();
      qc.setQueryData<Conversation[]>(conversationsKey, (old) => [conv, ...(old ?? [])]);
      setActiveId(conv.id);
      setMessages([]);
    } catch {
      toast.error("Couldn't start a new conversation.");
    }
  };

  return (
    <div className="grid h-[calc(100vh-9rem)] gap-4 lg:grid-cols-[260px_1fr]">
      {/* Conversation list */}
      <aside className="hidden flex-col rounded-xl border border-border bg-card p-3 shadow-card lg:flex">
        <Button onClick={newChat} className="bg-gradient-primary shadow-glow hover:opacity-90"><Plus className="mr-1.5 h-4 w-4" /> New chat</Button>
        <div className="mt-3 flex-1 space-y-1 overflow-y-auto scrollbar-thin">
          {convs.length === 0 && (
            <p className="px-3 py-6 text-center text-xs text-muted-foreground">No conversations yet.</p>
          )}
          {convs.map((c) => (
            <button
              key={c.id}
              onClick={() => setActiveId(c.id)}
              className={cn(
                "w-full truncate rounded-lg px-3 py-2 text-left text-sm transition-colors",
                c.id === activeId ? "bg-accent text-foreground" : "text-muted-foreground hover:bg-accent/40 hover:text-foreground",
              )}
            >
              {c.title}
            </button>
          ))}
        </div>
      </aside>

      {/* Chat */}
      <div className="flex min-h-0 flex-col rounded-xl border border-border bg-card shadow-card">
        <div className="flex items-center justify-between border-b border-border px-5 py-3">
          <div className="flex items-center gap-2">
            <div className="grid h-7 w-7 place-items-center rounded-lg bg-gradient-primary"><Sparkles className="h-3.5 w-3.5 text-primary-foreground" /></div>
            <p className="text-sm font-semibold">{active?.title ?? "AI Assistant"}</p>
          </div>
          <Button onClick={newChat} size="sm" variant="outline" className="lg:hidden"><Plus className="h-4 w-4" /></Button>
        </div>

        <div ref={scrollRef} className="flex-1 overflow-y-auto p-5 scrollbar-thin">
          {messages.length === 0 ? (
            <EmptyState onPick={send} />
          ) : (
            <div className="mx-auto max-w-3xl space-y-6">
              {messages.map((m) => <Bubble key={m.id} m={m} />)}
              {streaming && <TypingDots />}
            </div>
          )}
        </div>

        <div className="border-t border-border p-3">
          <div className="mx-auto max-w-3xl">
            <div className="rounded-xl border border-input bg-background/60 p-2 shadow-sm focus-within:border-primary/50 focus-within:shadow-glow">
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(input); } }}
                placeholder={`Message ${brand.name}... (Shift+Enter for newline)`}
                className="min-h-[44px] resize-none border-0 bg-transparent p-2 focus-visible:ring-0 focus-visible:ring-offset-0"
                rows={1}
              />
              <div className="flex items-center justify-between px-2 pb-1 pt-0.5">
                <Button size="sm" variant="ghost" className="h-7 gap-1.5 text-xs text-muted-foreground"><Paperclip className="h-3.5 w-3.5" /> Attach</Button>
                <Button onClick={() => send(input)} disabled={streaming || !input.trim()} size="sm" className="h-7 gap-1.5 bg-gradient-primary shadow-glow hover:opacity-90">
                  {streaming ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />} Send
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Bubble({ m }: { m: ChatMessage }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    await navigator.clipboard.writeText(m.content);
    setCopied(true);
    toast.success("Copied");
    setTimeout(() => setCopied(false), 1500);
  };
  const isUser = m.role === "user";
  return (
    <div className={cn("group flex gap-3 animate-fade-in", isUser && "flex-row-reverse")}>
      <div className={cn("grid h-8 w-8 shrink-0 place-items-center rounded-lg text-[11px] font-medium", isUser ? "bg-accent text-foreground" : "bg-gradient-primary text-primary-foreground shadow-glow")}>
        {isUser ? "You" : <Sparkles className="h-4 w-4" />}
      </div>
      <div className={cn("relative max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm", isUser ? "bg-primary/10 text-foreground" : "bg-accent/40 text-foreground")}>
        <div className="prose prose-sm prose-invert max-w-none [&_code]:rounded [&_code]:bg-background/60 [&_code]:px-1 [&_code]:py-0.5 [&_code]:text-xs [&_pre]:my-2 [&_pre]:rounded-lg [&_pre]:bg-background/80 [&_pre]:p-3 [&_pre]:text-xs [&>:first-child]:mt-0 [&>:last-child]:mb-0">
          <ReactMarkdown>{m.content || " "}</ReactMarkdown>
        </div>
        {!isUser && m.content && (
          <button onClick={copy} className="absolute -bottom-3 right-2 rounded-md border border-border bg-background px-1.5 py-1 text-[10px] opacity-0 shadow-sm transition-opacity group-hover:opacity-100">
            {copied ? <Check className="h-3 w-3 text-success" /> : <Copy className="h-3 w-3" />}
          </button>
        )}
      </div>
    </div>
  );
}

function TypingDots() {
  return (
    <div className="flex gap-3">
      <div className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-primary text-primary-foreground shadow-glow"><Sparkles className="h-4 w-4" /></div>
      <div className="flex items-center gap-1 rounded-2xl bg-accent/40 px-4 py-3">
        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground" style={{ animationDelay: "0ms" }} />
        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground" style={{ animationDelay: "150ms" }} />
        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground" style={{ animationDelay: "300ms" }} />
      </div>
    </div>
  );
}

function EmptyState({ onPick }: { onPick: (s: string) => void }) {
  return (
    <div className="mx-auto flex h-full max-w-2xl flex-col items-center justify-center text-center">
      <div className="grid h-14 w-14 place-items-center rounded-2xl bg-gradient-primary shadow-glow"><Sparkles className="h-6 w-6 text-primary-foreground" /></div>
      <h2 className="mt-4 text-2xl font-semibold tracking-tight">How can I help today?</h2>
      <p className="mt-1 text-sm text-muted-foreground">Ask anything about your business data.</p>
      <div className="mt-6 grid w-full gap-2 sm:grid-cols-2">
        {aiPromptSuggestions.map((p) => (
          <button key={p} onClick={() => onPick(p)} className="rounded-xl border border-border bg-background/40 p-3 text-left text-sm transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:bg-accent/40">
            {p}
          </button>
        ))}
      </div>
    </div>
  );
}
