import type { ReactNode } from "react";

/** Presentation-only types: map domain data in the consumer. */
export type MessageSide = "center" | "left" | "right";
export type MessageMediaKind = "audio" | "image" | "pdf";
export interface GenericMessageMedia { kind: MessageMediaKind; label?: string; url: string; }
export interface GenericMessage {
  authorTag?: string;
  id: string;
  media?: GenericMessageMedia;
  side: MessageSide;
  text: string;
  timestamp: Date | string;
}
export interface ConversationSummary {
  avatarUrl?: string;
  badge?: ReactNode;
  id: string;
  isSelected?: boolean;
  preview?: string;
  subtitle?: string;
  timestamp?: Date | string;
  title: string;
  unreadCount?: number;
}
export interface ConversationThreadLabels {
  errorLoading: string;
  loading: string;
  noMessages: string;
  pollingFallback?: string;
}
