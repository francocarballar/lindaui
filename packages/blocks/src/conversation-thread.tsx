"use client";
import { useEffect, useRef } from "react";
import { ScrollShadow } from "@lindaui/ui/scroll-shadow";
import { Spinner } from "@lindaui/ui/spinner";
import { groupByDay } from "@lindaui/ui/time-grouping";
import { ChatDateDivider } from "./chat-date-divider";
import { MessageBubble } from "./message-bubble";
import { EmptyChatView } from "./empty-chat-view";
import type { GenericMessage } from "./chat-types.js";

export interface ConversationThreadProps {
  messages: GenericMessage[];
  loading?: boolean;
  onImageClick?: (url: string) => void;
  emptyTitle?: string;
  emptyDescription?: string;
}

/** Timeline scrolleable con auto-scroll al último mensaje + agrupado por día. */
export function ConversationThread({
  messages,
  loading = false,
  onImageClick,
  emptyTitle = "Sin mensajes",
  emptyDescription,
}: ConversationThreadProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: "end" });
  }, [messages.length]);

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Spinner aria-label="Cargando mensajes" />
      </div>
    );
  }

  if (messages.length === 0) {
    return <EmptyChatView title={emptyTitle} description={emptyDescription} />;
  }

  const groups = groupByDay(messages, (m) => m.sentAt);

  return (
    <ScrollShadow className="h-full">
      <div className="flex flex-col gap-1 p-4">
        {groups.map((group) => (
          <div key={group.key}>
            <ChatDateDivider date={group.items[0]!.sentAt} />
            <div className="flex flex-col gap-1.5">
              {group.items.map((message) => (
                <MessageBubble key={message.id} message={message} onImageClick={onImageClick} />
              ))}
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
    </ScrollShadow>
  );
}
