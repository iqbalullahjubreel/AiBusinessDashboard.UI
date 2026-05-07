/**
 * Mock API layer.
 * Swap implementations with real fetch() calls to your ASP.NET Core backend.
 * Base URL is configurable via VITE_API_BASE_URL.
 */
import type { AuthSession, ChatMessage, Conversation, Summary, UploadedFile, User } from "@/lib/types";
import { conversations as mockConvs, mockUsers, recentFiles, summaries as mockSummaries } from "@/lib/mock-data";

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "/api";

const delay = (ms = 600) => new Promise((r) => setTimeout(r, ms));

function randomToken() {
  return "mock." + Math.random().toString(36).slice(2) + "." + Date.now().toString(36);
}

// Auth ---------------------------------------------------------------
export const authApi = {
  async login(email: string, _password: string): Promise<AuthSession> {
    await delay();
    const user: User = mockUsers.find((u) => u.email === email) ?? {
      id: "u-me",
      name: email.split("@")[0].replace(/\b\w/g, (c) => c.toUpperCase()),
      email,
      role: "admin",
      createdAt: new Date().toISOString(),
    };
    return { token: randomToken(), user };
  },
  async register(name: string, email: string, _password: string): Promise<AuthSession> {
    await delay();
    const user: User = { id: "u-new", name, email, role: "user", createdAt: new Date().toISOString() };
    return { token: randomToken(), user };
  },
  async forgotPassword(_email: string): Promise<{ ok: true }> {
    await delay();
    return { ok: true };
  },
  async logout(): Promise<void> {
    await delay(200);
  },
  async me(token: string | null): Promise<User | null> {
    await delay(150);
    if (!token) return null;
    try {
      const stored = localStorage.getItem("auth.user");
      return stored ? (JSON.parse(stored) as User) : null;
    } catch {
      return null;
    }
  },
};

// AI -----------------------------------------------------------------
const cannedReplies = [
  "Based on your latest data, the strongest growth lever is **enterprise expansion** — accounts on the Pro plan upgrading to Scale account for 41% of new ARR.\n\n```ts\n// suggested cohort filter\nconst cohort = users.filter(u => u.plan === 'pro' && u.usage > 0.7);\n```",
  "Here's a quick breakdown:\n\n- Revenue: **$284k** (+12%)\n- Active users: **12.4k** (+8%)\n- AI requests: **1.24M** (+24%)\n\nWant me to draft a board update from this?",
  "Summary of your uploaded report:\n\n1. Operating margin expanded to **28%**.\n2. EMEA leads regional growth at **+34%**.\n3. Churn dropped to **1.8%** after the onboarding revamp.",
];

export const aiApi = {
  async chat(_message: string, _conversationId?: string): Promise<ChatMessage> {
    await delay(900);
    const content = cannedReplies[Math.floor(Math.random() * cannedReplies.length)];
    return { id: crypto.randomUUID(), role: "assistant", content, createdAt: new Date().toISOString() };
  },
  async listConversations(): Promise<Conversation[]> {
    await delay(200);
    return mockConvs;
  },
  async getConversation(id: string): Promise<Conversation | undefined> {
    await delay(200);
    return mockConvs.find((c) => c.id === id);
  },
  async summarize(_text: string): Promise<Summary> {
    await delay(800);
    return {
      id: crypto.randomUUID(),
      title: "New Summary",
      source: "pasted-text",
      content: "Key insight: revenue concentration in top 10 accounts is **44%** — diversification recommended.",
      highlights: ["Top-10 = 44%", "Diversify"],
      tags: ["adhoc"],
      createdAt: new Date().toISOString(),
    };
  },
  async listSummaries(): Promise<Summary[]> {
    await delay(200);
    return mockSummaries;
  },
};

// Files --------------------------------------------------------------
let filesStore: UploadedFile[] = [...recentFiles];

export const filesApi = {
  async list(): Promise<UploadedFile[]> {
    await delay(200);
    return filesStore;
  },
  async upload(file: File, onProgress?: (p: number) => void): Promise<UploadedFile> {
    const item: UploadedFile = {
      id: crypto.randomUUID(),
      name: file.name,
      size: file.size,
      type: file.type || "application/octet-stream",
      status: "uploading",
      progress: 0,
      uploadedAt: new Date().toISOString(),
    };
    filesStore = [item, ...filesStore];
    for (let p = 10; p <= 100; p += 10) {
      await delay(120);
      onProgress?.(p);
      item.progress = p;
    }
    item.status = "ready";
    return item;
  },
  async remove(id: string): Promise<void> {
    await delay(150);
    filesStore = filesStore.filter((f) => f.id !== id);
  },
};
