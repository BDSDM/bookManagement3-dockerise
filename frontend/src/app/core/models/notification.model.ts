export interface Notification {
  id?: number; // optional if coming from WebSocket
  message: string;
  recipientEmail?: string; // optional, backend-only
  createdAt?: string; // optional, backend-only
  isRead?: boolean; // optional, backend-only
  timestamp?: string; // optional, WebSocket-only
}
