"use client";

import { Button, Spinner, TextArea } from "@lindaui/ui/compound";
import { Mic, Send } from "lucide-react";
import { useCallback } from "react";

export interface MessageComposerProps { disabled?: boolean; isSending?: boolean; onSend: () => void; onValueChange: (value: string) => void; placeholder?: string; value: string; }
/** Controlled glass composer; Enter sends and Shift+Enter retains a newline. */
export function MessageComposer({ value, onValueChange, onSend, isSending = false, placeholder, disabled = false }: MessageComposerProps) {
  const hasText = value.trim().length > 0;
  const handleChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => onValueChange(e.target.value), [onValueChange]);
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey && !isSending) {
      e.preventDefault();
      if (hasText) onSend();
    }
  }, [hasText, isSending, onSend]);
  return <div className="absolute inset-x-0 bottom-0 flex justify-center px-4 py-3">
    <div className="flex w-full items-end gap-2 rounded-3xl border border-white/30 bg-white/60 px-4 py-2 shadow-2xl backdrop-blur-2xl backdrop-saturate-200 transition-all lg:w-[70%] dark:border-white/15 dark:bg-slate-800/40">
      <TextArea aria-label={placeholder} className="field-sizing-content max-h-30 min-h-0 flex-1 resize-none overflow-y-auto border-none bg-transparent py-1 text-foreground shadow-none dark:text-white" disabled={disabled || isSending} onChange={handleChange} onKeyDown={handleKeyDown} placeholder={placeholder} rows={1} value={value} />
      <Button className="rounded-full bg-[#00a884] text-white" isDisabled={disabled || isSending} isIconOnly isPending={isSending} onPress={hasText ? onSend : undefined} size="sm" variant="primary">
        {({ isPending }) => isPending ? <Spinner color="current" size="sm" /> : hasText ? <Send className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
      </Button>
    </div>
  </div>;
}
