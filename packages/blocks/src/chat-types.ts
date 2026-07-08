/**
 * Tipos compartidos por la familia `chat-*`. Agnósticos de dominio — el
 * consumidor mapea su shape real (mensajes de WhatsApp, tickets, etc.) a
 * estos antes de pasarlos a los blocks.
 */

export type MessageSide = "incoming" | "outgoing";

export type MessageStatus = "sending" | "sent" | "delivered" | "read" | "failed";

export type GenericMessageMedia =
  | { kind: "image"; url: string; alt?: string }
  | { kind: "audio"; url: string; durationSeconds?: number }
  | { kind: "pdf"; url: string; name?: string };

export interface GenericMessage {
  id: string;
  side: MessageSide;
  text?: string;
  media?: GenericMessageMedia;
  sentAt: Date | number | string;
  status?: MessageStatus;
}

export interface ConversationSummary {
  id: string;
  title: string;
  subtitle?: string;
  avatarUrl?: string;
  lastMessageAt?: Date | number | string;
  unreadCount?: number;
}
