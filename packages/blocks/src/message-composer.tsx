"use client";
import type { KeyboardEvent } from "react";
import { Send } from "lucide-react";
import { Textarea } from "@lindaui/ui/textarea";
import { IconButton } from "@lindaui/ui/icon-button";

export interface MessageComposerProps {
  value: string;
  onValueChange: (value: string) => void;
  onSend: () => void;
  placeholder?: string;
  isSending?: boolean;
  isDisabled?: boolean;
  sendLabel?: string;
}

export function MessageComposer({
  value,
  onValueChange,
  onSend,
  placeholder = "Escribí un mensaje…",
  isSending = false,
  isDisabled = false,
  sendLabel = "Enviar",
}: MessageComposerProps) {
  const canSend = value.trim().length > 0 && !isSending && !isDisabled;

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (canSend) onSend();
    }
  };

  return (
    <div className="flex items-end gap-2 border-t border-border bg-card p-3">
      <div className="flex-1">
        <Textarea
          aria-label={placeholder}
          placeholder={placeholder}
          value={value}
          onChange={onValueChange}
          onKeyDown={handleKeyDown}
          isDisabled={isDisabled}
        />
      </div>
      <IconButton aria-label={sendLabel} onPress={onSend} isDisabled={!canSend}>
        <Send className="size-4" />
      </IconButton>
    </div>
  );
}
