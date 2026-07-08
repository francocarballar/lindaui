"use client";
import { formatShortTime } from "@lindaui/ui/date";
import { Check, CheckCheck, Clock, AlertCircle } from "lucide-react";
import { AudioPlayer } from "./audio-player";
import type { GenericMessage, MessageStatus } from "./chat-types.js";

export interface MessageBubbleProps {
  message: GenericMessage;
  onImageClick?: (url: string) => void;
}

const statusIcon: Record<MessageStatus, { icon: typeof Check; label: string }> = {
  sending: { icon: Clock, label: "Enviando" },
  sent: { icon: Check, label: "Enviado" },
  delivered: { icon: CheckCheck, label: "Entregado" },
  read: { icon: CheckCheck, label: "Leído" },
  failed: { icon: AlertCircle, label: "Error al enviar" },
};

export function MessageBubble({ message, onImageClick }: MessageBubbleProps) {
  const isOutgoing = message.side === "outgoing";
  const status = message.status ? statusIcon[message.status] : null;
  const StatusIcon = status?.icon;

  return (
    <div className={`flex ${isOutgoing ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[75%] rounded-2xl px-3 py-2 text-sm ${
          isOutgoing ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"
        }`}
      >
        {message.media?.kind === "image" && (
          <button
            type="button"
            onClick={() => onImageClick?.(message.media!.url)}
            className="-mx-1 -mt-1 mb-1 block overflow-hidden rounded-xl"
          >
            <img
              src={message.media.url}
              alt={message.media.alt ?? ""}
              className="max-h-64 w-full object-cover"
            />
          </button>
        )}
        {message.media?.kind === "audio" && (
          <div className="mb-1">
            <AudioPlayer src={message.media.url} durationSeconds={message.media.durationSeconds} />
          </div>
        )}
        {message.media?.kind === "pdf" && (
          <a
            href={message.media.url}
            target="_blank"
            rel="noreferrer"
            className="mb-1 block underline"
          >
            {message.media.name ?? "Documento"}
          </a>
        )}
        {message.text != null && (
          <p className="whitespace-pre-wrap break-words">{message.text}</p>
        )}
        <div className="mt-1 flex items-center justify-end gap-1 text-[10px] opacity-70">
          <span>{formatShortTime(message.sentAt)}</span>
          {isOutgoing && StatusIcon && <StatusIcon className="size-3" aria-label={status!.label} />}
        </div>
      </div>
    </div>
  );
}
