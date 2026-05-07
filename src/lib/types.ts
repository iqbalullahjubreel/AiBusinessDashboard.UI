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
