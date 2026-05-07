import type { ActivityItem, Conversation, KPI, Notification, Summary, UploadedFile, User } from "./types";

export const mockUsers: User[] = [
  { id: "u1", name: "Alex Morgan", email: "alex@nova.ai", role: "admin", createdAt: "2024-01-12", avatar: "" },
  { id: "u2", name: "Priya Shah", email: "priya@nova.ai", role: "analyst", createdAt: "2024-02-04", avatar: "" },
  { id: "u3", name: "Marcus Lee", email: "marcus@nova.ai", role: "user", createdAt: "2024-03-18", avatar: "" },
  { id: "u4", name: "Sara Kim", email: "sara@nova.ai", role: "user", createdAt: "2024-04-22", avatar: "" },
  { id: "u5", name: "Jonas Weber", email: "jonas@nova.ai", role: "analyst", createdAt: "2024-05-09", avatar: "" },
  { id: "u6", name: "Lina Park", email: "lina@nova.ai", role: "user", createdAt: "2024-06-14", avatar: "" },
];

export const kpis: KPI[] = [
  { label: "Revenue", value: "$284,920", delta: 12.4, trend: [10, 12, 14, 13, 18, 22, 26] },
  { label: "Active Users", value: "12,438", delta: 8.2, trend: [8, 9, 11, 12, 14, 13, 16] },
  { label: "AI Requests", value: "1.24M", delta: 24.1, trend: [4, 6, 8, 10, 14, 18, 24] },
  { label: "Conversion", value: "4.83%", delta: -1.3, trend: [6, 5, 5, 4, 5, 4, 4] },
];

export const revenueSeries = [
  { m: "Jan", revenue: 18400, users: 1200 },
  { m: "Feb", revenue: 22300, users: 1480 },
  { m: "Mar", revenue: 26800, users: 1690 },
  { m: "Apr", revenue: 24100, users: 1820 },
  { m: "May", revenue: 31200, users: 2110 },
  { m: "Jun", revenue: 36900, users: 2430 },
  { m: "Jul", revenue: 41200, users: 2780 },
  { m: "Aug", revenue: 39400, users: 2940 },
  { m: "Sep", revenue: 47200, users: 3220 },
  { m: "Oct", revenue: 52800, users: 3510 },
  { m: "Nov", revenue: 58400, users: 3890 },
  { m: "Dec", revenue: 64900, users: 4220 },
];

export const aiUsageSeries = [
  { d: "Mon", chat: 420, summarize: 180, files: 90 },
  { d: "Tue", chat: 510, summarize: 220, files: 120 },
  { d: "Wed", chat: 480, summarize: 260, files: 140 },
  { d: "Thu", chat: 620, summarize: 310, files: 180 },
  { d: "Fri", chat: 720, summarize: 280, files: 210 },
  { d: "Sat", chat: 380, summarize: 140, files: 80 },
  { d: "Sun", chat: 290, summarize: 110, files: 60 },
];

export const conversionSeries = [
  { name: "Direct", value: 38 },
  { name: "Search", value: 27 },
  { name: "Social", value: 18 },
  { name: "Referral", value: 17 },
];

export const activity: ActivityItem[] = [
  { id: "a1", user: "Alex Morgan", action: "uploaded", target: "Q4-revenue.csv", time: "2m ago" },
  { id: "a2", user: "Priya Shah", action: "summarized", target: "Annual Report.pdf", time: "14m ago" },
  { id: "a3", user: "Marcus Lee", action: "started chat", target: "Pricing strategy", time: "1h ago" },
  { id: "a4", user: "Sara Kim", action: "exported", target: "User analytics", time: "3h ago" },
  { id: "a5", user: "Jonas Weber", action: "invited", target: "lina@nova.ai", time: "Yesterday" },
];

export const recentFiles: UploadedFile[] = [
  { id: "f1", name: "Q4-revenue.csv", size: 248_000, type: "text/csv", status: "ready", progress: 100, uploadedAt: "2025-05-04" },
  { id: "f2", name: "Annual Report.pdf", size: 4_120_000, type: "application/pdf", status: "ready", progress: 100, uploadedAt: "2025-05-03" },
  { id: "f3", name: "Roadmap.docx", size: 612_000, type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document", status: "processing", progress: 64, uploadedAt: "2025-05-06" },
  { id: "f4", name: "Hero-banner.png", size: 1_280_000, type: "image/png", status: "ready", progress: 100, uploadedAt: "2025-05-02" },
];

export const summaries: Summary[] = [
  {
    id: "s1",
    title: "Q4 Revenue Breakdown",
    source: "Q4-revenue.csv",
    content:
      "Revenue grew **23% YoY** driven by enterprise plan upgrades. Churn dropped to 1.8% as the new onboarding cohort completed activation. EMEA leads regional growth at +34%.",
    highlights: ["Enterprise +41%", "Churn 1.8%", "EMEA +34%"],
    tags: ["finance", "growth"],
    createdAt: "2025-05-04",
  },
  {
    id: "s2",
    title: "Annual Report Highlights",
    source: "Annual Report.pdf",
    content:
      "Operating margin expanded to 28%. R&D investment focused on the AI Copilot suite. The team expects to ship the public API in Q2 and double the partner ecosystem by year end.",
    highlights: ["Op. margin 28%", "Public API Q2", "2x partners"],
    tags: ["strategy", "annual"],
    createdAt: "2025-05-03",
  },
  {
    id: "s3",
    title: "Customer Support Trends",
    source: "support-tickets.csv",
    content:
      "Average resolution time dropped to 4.2 hours. Top recurring topic is API rate limits — recommend a self-serve quota viewer to reduce inbound tickets by ~18%.",
    highlights: ["Resolution 4.2h", "Rate limits #1", "-18% tickets potential"],
    tags: ["support", "ops"],
    createdAt: "2025-05-01",
  },
];

export const conversations: Conversation[] = [
  {
    id: "c1",
    title: "Pricing strategy ideas",
    updatedAt: "2025-05-06",
    messages: [
      { id: "m1", role: "user", content: "What pricing tiers should we test for the Pro plan?", createdAt: "2025-05-06T10:00:00Z" },
      { id: "m2", role: "assistant", content: "Here are three tiers worth testing:\n\n1. **Starter** — $19/mo, 5 seats\n2. **Pro** — $49/mo, 20 seats + AI Copilot\n3. **Scale** — $149/mo, unlimited + SSO\n\nA/B test on landing page CTA conversion.", createdAt: "2025-05-06T10:00:08Z" },
    ],
  },
  {
    id: "c2",
    title: "Q4 board deck outline",
    updatedAt: "2025-05-05",
    messages: [
      { id: "m3", role: "user", content: "Draft an outline for the Q4 board deck.", createdAt: "2025-05-05T09:00:00Z" },
      { id: "m4", role: "assistant", content: "**Q4 Board Deck Outline**\n\n- Highlights & lowlights\n- Financials\n- Product milestones\n- GTM update\n- Hiring plan\n- 2026 strategy\n- Ask", createdAt: "2025-05-05T09:00:06Z" },
    ],
  },
  { id: "c3", title: "Onboarding email rewrite", updatedAt: "2025-05-04", messages: [] },
];

export const notifications: Notification[] = [
  { id: "n1", title: "New summary ready", description: "Annual Report.pdf has been summarized", time: "2m", read: false, type: "success" },
  { id: "n2", title: "Upload complete", description: "Q4-revenue.csv processed", time: "12m", read: false, type: "info" },
  { id: "n3", title: "API quota at 80%", description: "Consider upgrading your plan", time: "1h", read: true, type: "warning" },
  { id: "n4", title: "Weekly report", description: "Your usage report is ready", time: "Yesterday", read: true, type: "info" },
];

export const aiPromptSuggestions = [
  "Summarize my latest uploaded report",
  "Show me the top 3 revenue drivers this quarter",
  "Draft a customer follow-up email",
  "What are the key risks in my Q4 data?",
];
