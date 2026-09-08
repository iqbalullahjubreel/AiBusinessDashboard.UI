export type Role = "admin" | "user" | "analyst";

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: Role;
  createdAt: string;
}

export interface AuthSession {
  token: string;
  user: User;
}

export interface KPI {
  label: string;
  value: string;
  delta: number;
  trend: number[];
}

export interface ActivityItem {
  id: string;
  user: string;
  action: string;
  target: string;
  time: string;
}

export interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  status: "uploading" | "processing" | "ready" | "error";
  progress: number;
  uploadedAt: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: string;
}

export interface Conversation {
  id: string;
  title: string;
  updatedAt: string;
  messages: ChatMessage[];
}

export interface Summary {
  id: string;
  title: string;
  source: string;
  content: string;
  highlights: string[];
  tags: string[];
  createdAt: string;
}

export interface Notification {
  id: string;
  title: string;
  description: string;
  time: string;
  read: boolean;
  type: "info" | "success" | "warning" | "error";
}

// --- Backend DTOs -----------------------------------------------------
export interface AnalyticsPoint {
  date: string;
  chats: number;
  filesUploaded: number;
  summariesCreated: number;
}

export interface AnalyticsSummary {
  totalChats: number;
  totalFiles: number;
  totalSummaries: number;
  series: AnalyticsPoint[];
}

export interface NotificationItem {
  id: string;
  title: string;
  description: string;
  type: "info" | "success" | "warning" | "error";
  isRead: boolean;
  createdAt: string;
}

export interface NotificationPreference {
  category: string;
  displayName: string;
  enabled: boolean;
}

export interface Subscription {
  planName: string;
  status: string;
  monthlyQuota: number;
  usedThisPeriod: number;
  currentPeriodEnd: string;
}

export interface Plan {
  name: string;
  monthlyQuota: number;
  priceNGN: number;
}

export interface BillingRecord {
  id?: string;
  reference: string;
  amountKobo: number;
  status: string;
  paidAt: string | null;
}

export interface ApiKey {
  id: string;
  name: string;
  prefix: string;
  createdAt: string;
  lastUsedAt: string | null;
}

export interface CreatedApiKey extends ApiKey {
  plainKey: string;
}

export interface AdminUser {
  id: string;
  fullName: string;
  email: string;
  role: string;
  createdAt: string;
}

export interface AdminSubscription {
  id?: string;
  userEmail: string;
  planName: string;
  status: string;
  currentPeriodEnd: string;
}

export interface FeatureFlag {
  id: string;
  name: string;
  enabled: boolean;
}

export interface AdminFile {
  id: string;
  name: string;
  ownerEmail: string;
  size: number;
  uploadedAt: string;
}

export interface AdminActivityItem {
  id: string;
  description: string;
  userEmail: string;
  createdAt: string;
}

export interface AdminLog {
  id: string;
  actorEmail: string;
  action: string;
  details: string;
  createdAt: string;
}
