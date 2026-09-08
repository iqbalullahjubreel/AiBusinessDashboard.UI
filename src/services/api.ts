/**
 * Real API layer — talks to your ASP.NET Core backend.
 * Base URL is configurable via VITE_API_BASE_URL.
 *
 * NOTES / ASSUMPTIONS (check these against your actual @/lib/types.ts):
 * - User: { id, name, email, role, createdAt }
 * - AuthSession: { token, user }
 * - ChatMessage: { id, role, content, createdAt }
 * - Conversation: { id, title, createdAt }
 * - Summary: { id, uploadedFileId?, summary, tags, keyPoints, createdAt }
 * - UploadedFile: { id, name, size, type, status, progress, uploadedAt }
 *
 * NEW in this version: analyticsApi, notificationsApi, notificationPreferencesApi,
 * adminApi, subscriptionApi, apiKeysApi. None of these have matching entries in
 * @/lib/types yet — the interfaces below are the source of truth for their shapes
 * until you add proper types. All response field names assume ASP.NET Core's
 * default camelCase JSON serialization (matches every other DTO in this file).
 */
import type {
    AuthSession,
    ChatMessage,
    Conversation,
    Summary,
    UploadedFile,
    User,
} from "@/lib/types";

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "/api";

// ---------------------------------------------------------------------
// Token storage
// ---------------------------------------------------------------------
const TOKEN_KEY = "auth.token";
const USER_KEY = "auth.user";

export function getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
}

function setSession(token: string, user: User) {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
}

function clearSession() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
}

// ---------------------------------------------------------------------
// Fetch wrapper — attaches Bearer token, parses JSON, throws on error
// ---------------------------------------------------------------------
export class ApiError extends Error {
    status: number;
    constructor(status: number, message: string) {
        super(message);
        this.status = status;
    }
}

async function apiFetch<T>(
    path: string,
    options: RequestInit = {},
    authenticated = true
): Promise<T> {
    const headers: Record<string, string> = {
        ...(options.headers as Record<string, string> | undefined),
    };

    const isFormData = options.body instanceof FormData;
    if (!isFormData) {
        headers["Content-Type"] = "application/json";
    }

    if (authenticated) {
        const token = getToken();
        if (token) headers["Authorization"] = `Bearer ${token}`;
    }

    const res = await fetch(`${API_BASE_URL}${path}`, { ...options, headers });

    // 204 No Content or empty body
    const text = await res.text();
    const body = text ? JSON.parse(text) : null;

    if (!res.ok) {
        const message = body?.message ?? body?.title ?? `Request failed (${res.status})`;
        if (res.status === 401) clearSession();
        throw new ApiError(res.status, message);
    }

    return body as T;
}

// ---------------------------------------------------------------------
// Auth
// ---------------------------------------------------------------------
interface AuthResponseDto {
    token: string;
    id: string;
    email: string;
    fullName: string;
    role: string;
    createdAt: string;
}

interface UserDto {
    id: string;
    fullName: string;
    email: string;
    role: string;
}

function toUser(dto: AuthResponseDto | UserDto, fallbackCreatedAt = ""): User {
    return {
        id: dto.id,
        name: dto.fullName,
        email: dto.email,
        role: dto.role as User["role"],
        createdAt: "createdAt" in dto ? dto.createdAt : fallbackCreatedAt,
    };
}

export const authApi = {
    async login(email: string, password: string): Promise<AuthSession> {
        const dto = await apiFetch<AuthResponseDto>(
            "/auth/login",
            { method: "POST", body: JSON.stringify({ email, password }) },
            false
        );
        const user = toUser(dto);
        setSession(dto.token, user);
        return { token: dto.token, user };
    },

    async register(name: string, email: string, password: string): Promise<AuthSession> {
        const dto = await apiFetch<AuthResponseDto>(
            "/auth/register",
            { method: "POST", body: JSON.stringify({ fullName: name, email, password }) },
            false
        );
        const user = toUser(dto);
        setSession(dto.token, user);
        return { token: dto.token, user };
    },

    async forgotPassword(email: string): Promise<{ ok: true }> {
        await apiFetch("/auth/forgot-password", { method: "POST", body: JSON.stringify({ email }) }, false);
        return { ok: true };
    },

    async resetPassword(email: string, token: string, newPassword: string): Promise<{ ok: true }> {
        await apiFetch(
            "/auth/reset-password",
            { method: "POST", body: JSON.stringify({ email, token, newPassword }) },
            false
        );
        return { ok: true };
    },

    async logout(): Promise<void> {
        try {
            await apiFetch("/auth/logout", { method: "POST" });
        } finally {
            clearSession();
        }
    },

    async me(): Promise<User | null> {
        const token = getToken();
        if (!token) return null;
        try {
            const dto = await apiFetch<UserDto>("/auth/me", { method: "GET" });
            return toUser(dto);
        } catch {
            return null;
        }
    },
};

// ---------------------------------------------------------------------
// AI — chat, conversations, summaries
// ---------------------------------------------------------------------
interface ChatResponseDto {
    reply: string;
    conversationId: string;
    title: string | null;
}

interface ConversationDto {
    id: string;
    title: string;
    createdAt: string;
}

interface MessageDto {
    id: string;
    role: string;
    content: string;
    createdAt: string;
}

interface ConversationDetailsDto extends ConversationDto {
    messages: MessageDto[];
}

interface AiSummaryDto {
    id: string;
    uploadedFileId: string;
    summary: string;
    tags: string;
    createdAt: string;
    keyPoints: string[];
}

function toSummary(dto: AiSummaryDto): Summary {
    return {
        id: dto.id,
        title: dto.summary.slice(0, 60),
        source: dto.uploadedFileId && dto.uploadedFileId !== "00000000-0000-0000-0000-000000000000"
            ? "file"
            : "pasted-text",
        content: dto.summary,
        highlights: dto.keyPoints ?? [],
        tags: dto.tags ? dto.tags.split(",").map((t) => t.trim()) : [],
        createdAt: dto.createdAt,
    };
}

export const aiApi = {
    async chat(message: string, conversationId?: string): Promise<ChatMessage> {
        const dto = await apiFetch<ChatResponseDto>("/ai/chat", {
            method: "POST",
            body: JSON.stringify({ message, conversationId: conversationId ?? null }),
        });
        return {
            id: crypto.randomUUID(),
            role: "assistant",
            content: dto.reply,
            createdAt: new Date().toISOString(),
        };
    },

    /**
     * Streams a chat reply via SSE. Backend endpoint is GET (not POST) and
     * takes conversationId/message as query params. Uses fetch + manual SSE
     * parsing (not EventSource) because EventSource can't send Authorization headers.
     *
     * onMeta fires once with the conversationId (useful if a new conversation
     * was just created). onChunk fires for each text chunk as it streams in.
     *
     * NOTE: a 402 (quota exceeded) comes back as a JSON error body, not a
     * stream — this throws ApiError(402, ...) same as any other failed request.
     * Catch it in the UI and show an upgrade prompt.
     */
    async streamChat(
        message: string,
        conversationId: string | undefined,
        onChunk: (chunk: string) => void,
        onMeta?: (conversationId: string) => void
    ): Promise<void> {
        const token = getToken();
        const params = new URLSearchParams({ message });
        if (conversationId) params.set("conversationId", conversationId);

        const res = await fetch(`${API_BASE_URL}/ai/chat/stream?${params.toString()}`, {
            method: "GET",
            headers: token ? { Authorization: `Bearer ${token}` } : {},
        });

        if (!res.ok || !res.body) {
            let message = "Stream failed to start";
            try {
                const body = await res.json();
                message = body?.message ?? message;
            } catch {
                /* body wasn't JSON, keep default message */
            }
            throw new ApiError(res.status, message);
        }

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";
        let pendingEvent: string | null = null;

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            buffer += decoder.decode(value, { stream: true });

            const lines = buffer.split("\n");
            buffer = lines.pop() ?? "";

            for (const line of lines) {
                if (line.startsWith("event: ")) {
                    pendingEvent = line.slice("event: ".length).trim();
                } else if (line.startsWith("data: ")) {
                    const data = line.slice("data: ".length);
                    if (pendingEvent === "meta") {
                        try {
                            const parsed = JSON.parse(data);
                            onMeta?.(parsed.conversationId);
                        } catch {
                            /* ignore malformed meta */
                        }
                    } else {
                        onChunk(data);
                    }
                    pendingEvent = null;
                }
            }
        }
    },

    async listConversations(): Promise<Conversation[]> {
        const dtos = await apiFetch<ConversationDto[]>("/conversations", { method: "GET" });
        return dtos.map((d) => ({ id: d.id, title: d.title, createdAt: d.createdAt }));
    },

    async getConversation(id: string): Promise<Conversation | undefined> {
        const dto = await apiFetch<ConversationDetailsDto>(`/conversations/${id}`, { method: "GET" });
        return { id: dto.id, title: dto.title, createdAt: dto.createdAt };
    },

    async createConversation(): Promise<Conversation> {
        const dto = await apiFetch<ConversationDto>("/conversations", { method: "POST" });
        return { id: dto.id, title: dto.title, createdAt: dto.createdAt };
    },

    async updateConversationTitle(id: string, title: string): Promise<void> {
        await apiFetch(`/conversations/${id}/title`, { method: "PATCH", body: JSON.stringify({ title }) });
    },

    async deleteConversation(id: string): Promise<void> {
        await apiFetch(`/conversations/${id}`, { method: "DELETE" });
    },

    async summarize(text: string): Promise<Summary> {
        const dto = await apiFetch<AiSummaryDto>("/ai/summaries", {
            method: "POST",
            body: JSON.stringify({ text }),
        });
        return toSummary(dto);
    },

    async listSummaries(tag?: string): Promise<Summary[]> {
        const query = tag ? `?tag=${encodeURIComponent(tag)}` : "";
        const dtos = await apiFetch<AiSummaryDto[]>(`/ai/summaries${query}`, { method: "GET" });
        return dtos.map(toSummary);
    },
};

// ---------------------------------------------------------------------
// Files
// ---------------------------------------------------------------------
interface FileDto {
    id: string;
    name: string;
    size: number;
    type: string;
    uploadedAt: string;
}

interface FileUploadResponseDto {
    id: string;
    fileName: string;
    filePath: string;
    summary: string;
    keyPoints: string[];
    tags: string;
}

function toUploadedFile(dto: FileDto): UploadedFile {
    return {
        id: dto.id,
        name: dto.name,
        size: dto.size,
        type: dto.type,
        status: "ready",
        progress: 100,
        uploadedAt: dto.uploadedAt,
    };
}

export const filesApi = {
    async list(): Promise<UploadedFile[]> {
        const dtos = await apiFetch<FileDto[]>("/files", { method: "GET" });
        return dtos.map(toUploadedFile);
    },

    /**
     * Real upload with real progress, using XMLHttpRequest (fetch has no
     * upload progress event). Backend response doesn't include size/type,
     * so those are taken from the original File object.
     *
     * NOTE: on 402 (quota exceeded), the backend rejects BEFORE processing
     * the file — xhr.status will be 402, handled below same as other errors.
     */
    upload(file: File, onProgress?: (p: number) => void): Promise<UploadedFile> {
        return new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            const formData = new FormData();
            formData.append("file", file);

            xhr.open("POST", `${API_BASE_URL}/files/upload`);

            const token = getToken();
            if (token) xhr.setRequestHeader("Authorization", `Bearer ${token}`);

            xhr.upload.onprogress = (event) => {
                if (event.lengthComputable) {
                    onProgress?.(Math.round((event.loaded / event.total) * 100));
                }
            };

            xhr.onload = () => {
                if (xhr.status >= 200 && xhr.status < 300) {
                    try {
                        const dto: FileUploadResponseDto = JSON.parse(xhr.responseText);
                        resolve({
                            id: dto.id,
                            name: dto.fileName,
                            size: file.size,
                            type: file.type || "application/octet-stream",
                            status: "ready",
                            progress: 100,
                            uploadedAt: new Date().toISOString(),
                        });
                    } catch (err) {
                        reject(err);
                    }
                } else {
                    if (xhr.status === 401) clearSession();
                    let message = "Upload failed";
                    try {
                        const body = JSON.parse(xhr.responseText);
                        message = body?.message ?? message;
                    } catch {
                        /* response wasn't JSON */
                    }
                    reject(new ApiError(xhr.status, message));
                }
            };

            xhr.onerror = () => reject(new ApiError(0, "Network error during upload"));
            xhr.send(formData);
        });
    },

    async remove(id: string): Promise<void> {
        await apiFetch(`/files/${id}`, { method: "DELETE" });
    },

    /** File + AI-analysis dashboard view (joined data, only files with a completed AI result). */
    async dashboard(): Promise<
        { fileId: string; fileName: string; summary: string; keyPoints: string[]; tags: string; createdAt: string }[]
    > {
        return apiFetch("/files/dashboard", { method: "GET" });
    },
};

// ---------------------------------------------------------------------
// Analytics
// ---------------------------------------------------------------------
export interface UsagePoint {
    date: string;
    chats: number;
    filesUploaded: number;
    summariesCreated: number;
}

export interface AnalyticsSummary {
    totalChats: number;
    totalFiles: number;
    totalSummaries: number;
    series: UsagePoint[];
}

export const analyticsApi = {
    /** Current user's own usage. */
    async getMine(days = 30): Promise<AnalyticsSummary> {
        return apiFetch(`/analytics?days=${days}`, { method: "GET" });
    },

    /** Admin-only: platform-wide usage across all users. 403s for non-admins. */
    async getPlatform(days = 30): Promise<AnalyticsSummary> {
        return apiFetch(`/analytics/platform?days=${days}`, { method: "GET" });
    },
};

// ---------------------------------------------------------------------
// Notifications
// ---------------------------------------------------------------------
export interface AppNotification {
    id: string;
    title: string;
    description: string;
    type: "success" | "info" | "warning" | "error";
    isRead: boolean;
    createdAt: string;
}

export const notificationsApi = {
    async list(): Promise<AppNotification[]> {
        return apiFetch("/notifications", { method: "GET" });
    },

    async markRead(id: string): Promise<void> {
        await apiFetch(`/notifications/${id}/read`, { method: "PATCH" });
    },

    async markAllRead(): Promise<void> {
        await apiFetch("/notifications/read-all", { method: "PATCH" });
    },
};

// ---------------------------------------------------------------------
// Notification Preferences
// ---------------------------------------------------------------------
export interface NotificationPreference {
    category: string;
    displayName: string;
    enabled: boolean;
}

export const notificationPreferencesApi = {
    async list(): Promise<NotificationPreference[]> {
        return apiFetch("/notification-preferences", { method: "GET" });
    },

    async update(category: string, enabled: boolean): Promise<void> {
        await apiFetch(`/notification-preferences/${category}`, {
            method: "PATCH",
            body: JSON.stringify(enabled),
        });
    },
};

// ---------------------------------------------------------------------
// Subscriptions / Billing (Paystack)
// ---------------------------------------------------------------------
export interface Plan {
    name: string;
    paystackPlanCode: string | null;
    monthlyQuota: number;
    priceNGN: number;
}

export interface SubscriptionStatus {
    planName: string;
    status: string;
    monthlyQuota: number;
    usedThisPeriod: number;
    currentPeriodEnd: string | null;
}

export interface BillingTransaction {
    reference: string;
    amountKobo: number;
    status: string;
    paidAt: string | null;
    customerCode: string;
}

export const subscriptionApi = {
    /** Public — no auth required, used on a pricing page before login. */
    async getPlans(): Promise<Plan[]> {
        return apiFetch("/subscriptions/plans", { method: "GET" }, false);
    },

    async getMine(): Promise<SubscriptionStatus> {
        return apiFetch("/subscriptions/me", { method: "GET" });
    },

    /**
     * Kicks off a Paystack checkout for a paid plan. Returns the authorization
     * URL to redirect the browser to. For the Free plan, the backend applies
     * it instantly and returns an empty string — no redirect needed.
     */
    async initialize(planName: string): Promise<{ authorizationUrl: string }> {
        return apiFetch("/subscriptions/initialize", {
            method: "POST",
            body: JSON.stringify({ planName }),
        });
    },

    async getBillingHistory(): Promise<BillingTransaction[]> {
        return apiFetch("/subscriptions/billing-history", { method: "GET" });
    },
};

// ---------------------------------------------------------------------
// API Keys
// ---------------------------------------------------------------------
export interface ApiKey {
    id: string;
    name: string;
    prefix: string;
    revoked: boolean;
    createdAt: string;
    lastUsedAt: string | null;
}

export const apiKeysApi = {
    async list(): Promise<ApiKey[]> {
        return apiFetch("/api-keys", { method: "GET" });
    },

    /** plainKey is shown ONCE here — the backend never returns it again after this call. */
    async create(name: string): Promise<{ plainKey: string; key: ApiKey }> {
        return apiFetch("/api-keys", { method: "POST", body: JSON.stringify({ name }) });
    },

    async revoke(id: string): Promise<void> {
        await apiFetch(`/api-keys/${id}`, { method: "DELETE" });
    },
};

// ---------------------------------------------------------------------
// Admin — every call here requires the logged-in user to have Role: "Admin".
// Non-admins get a 403 from the backend; the UI should never show these
// controls to non-admin users, but these calls will safely fail either way.
// ---------------------------------------------------------------------
export interface AdminUser {
    id: string;
    fullName: string;
    email: string;
    role: string;
    createdAt: string;
}

export interface AdminSubscriptionOverview {
    userId: string;
    userEmail: string;
    planName: string;
    status: string;
    currentPeriodEnd: string | null;
}

export interface FeatureFlag {
    id: string;
    key: string;
    name: string;
    enabled: boolean;
}

export interface AdminFile {
    id: string;
    name: string;
    size: number;
    type: string;
    uploadedAt: string;
    ownerEmail: string;
}

export interface ActivityItem {
    type: "chat" | "file" | "summary";
    description: string;
    userEmail: string;
    createdAt: string;
}

export interface AuditLog {
    id: string;
    actorEmail: string;
    action: string;
    details: string;
    createdAt: string;
}

export const adminApi = {
    async getUsers(): Promise<AdminUser[]> {
        return apiFetch("/admin/users", { method: "GET" });
    },

    async updateUserRole(userId: string, role: string): Promise<void> {
        await apiFetch(`/admin/users/${userId}/role`, { method: "PATCH", body: JSON.stringify({ role }) });
    },

    async getSubscriptions(): Promise<AdminSubscriptionOverview[]> {
        return apiFetch("/admin/subscriptions", { method: "GET" });
    },

    async getFeatureFlags(): Promise<FeatureFlag[]> {
        return apiFetch("/admin/feature-flags", { method: "GET" });
    },

    async toggleFeatureFlag(id: string, enabled: boolean): Promise<void> {
        await apiFetch(`/admin/feature-flags/${id}`, { method: "PATCH", body: JSON.stringify(enabled) });
    },

    async getAllFiles(): Promise<AdminFile[]> {
        return apiFetch("/admin/files", { method: "GET" });
    },

    async deleteFile(id: string): Promise<void> {
        await apiFetch(`/admin/files/${id}`, { method: "DELETE" });
    },

    async getActivity(limit = 50): Promise<ActivityItem[]> {
        return apiFetch(`/admin/activity?limit=${limit}`, { method: "GET" });
    },

    async getLogs(limit = 100): Promise<AuditLog[]> {
        return apiFetch(`/admin/logs?limit=${limit}`, { method: "GET" });
    },
};