"use client";

import { ScrollShadow, Spinner } from "@lindaui/ui/compound";
import { cn } from "@lindaui/ui/cn";
import dayjs from "dayjs";
import { AlertCircle } from "lucide-react";
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, type ReactNode } from "react";
import { DateDivider } from "./date-divider";
import { MessageBubble } from "./message-bubble";
import type { ConversationThreadLabels, GenericMessage } from "./types";

export interface ConversationThreadProps {
  /** undefined uses the original light/dark pattern; null uses a flat background. */
  backgroundImage?: { dark: string; light: string } | null;
  isError?: boolean;
  isLoading?: boolean;
  labels: ConversationThreadLabels;
  messages: GenericMessage[];
  showPollingFallback?: boolean;
  /** Optional virtualizer. The consumer owns row placement and date dividers. */
  renderMessages?: (messages: GenericMessage[], renderMessage: (message: GenericMessage) => ReactNode) => ReactNode;
}
const DEFAULT_BACKGROUND = { dark: "/images/chat-bg-dark.png", light: "/images/chat-bg-light.png" } as const;
export function ConversationThread({ messages, isLoading = false, isError = false, labels, backgroundImage, showPollingFallback = false, renderMessages }: ConversationThreadProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const messageListRef = useRef<HTMLDivElement>(null);
  const groupedMessages = useMemo(() => {
    const groups: { date: Date | string; messages: GenericMessage[] }[] = [];
    let currentDay = "";
    for (const msg of messages) {
      const day = dayjs(msg.timestamp).format("YYYY-MM-DD");
      if (day === currentDay) groups.at(-1)?.messages.push(msg);
      else { currentDay = day; groups.push({ date: msg.timestamp, messages: [msg] }); }
    }
    return groups;
  }, [messages]);
  const hasScrolledOnLoad = useRef(false);
  const firstId = messages.at(0)?.id ?? "";
  const prevFirstIdRef = useRef(firstId);
  const scrollToBottom = useCallback((behavior: ScrollBehavior = "smooth") => {
    const el = scrollRef.current;
    if (!el) return;
    if (behavior === "auto") { el.scrollTop = el.scrollHeight; return; }
    el.scrollTo({ behavior, top: el.scrollHeight });
  }, []);
  useLayoutEffect(() => {
    if (prevFirstIdRef.current !== firstId) { prevFirstIdRef.current = firstId; hasScrolledOnLoad.current = false; }
    if (isLoading || messages.length === 0 || hasScrolledOnLoad.current) return;
    const el = scrollRef.current;
    const listEl = messageListRef.current;
    if (!el || !listEl) return;
    let settleTimeout: ReturnType<typeof setTimeout> | null = null;
    let settled = false;
    const scrollNow = () => { el.scrollTop = el.scrollHeight; };
    const scheduleSettle = () => {
      if (settleTimeout) clearTimeout(settleTimeout);
      settleTimeout = setTimeout(() => {
        settled = true;
        hasScrolledOnLoad.current = true;
        resizeObserver.disconnect();
        mutationObserver.disconnect();
      }, 250);
    };
    scrollNow();
    scheduleSettle();
    const resizeObserver = new ResizeObserver(() => { if (!settled) { scrollNow(); scheduleSettle(); } });
    const mutationObserver = new MutationObserver(() => { if (!settled) { scrollNow(); scheduleSettle(); } });
    resizeObserver.observe(listEl);
    mutationObserver.observe(listEl, { childList: true, subtree: true });
    return () => { if (settleTimeout) clearTimeout(settleTimeout); resizeObserver.disconnect(); mutationObserver.disconnect(); };
  }, [isLoading, messages.length, firstId]);
  const messageCount = messages.length;
  const prevMessageCount = useRef(messageCount);
  useEffect(() => {
    if (messageCount > prevMessageCount.current) requestAnimationFrame(() => scrollToBottom("smooth"));
    prevMessageCount.current = messageCount;
  }, [messageCount, scrollToBottom]);
  const bg = backgroundImage === undefined ? DEFAULT_BACKGROUND : backgroundImage;
  const renderMessage = (message: GenericMessage) => <MessageBubble key={message.id} message={message} />;
  return <div className={cn("relative flex h-full flex-col", bg ? "bg-[#efeae2] dark:bg-[#0b141a]" : "bg-background")}>
    {bg && <><div className="pointer-events-none absolute inset-0 bg-contain opacity-15 dark:hidden" style={{ backgroundImage: `url('${bg.light}')` }} /><div className="pointer-events-none absolute inset-0 hidden bg-contain opacity-15 dark:block" style={{ backgroundImage: `url('${bg.dark}')` }} /></>}
    {showPollingFallback && labels.pollingFallback && <div className="flex items-center justify-center py-1.5 text-muted text-xs">{labels.pollingFallback}</div>}
    <ScrollShadow className="relative flex-1 overflow-y-auto px-4 pt-4 pb-20" ref={scrollRef}>
      {isLoading && <div className="flex items-center justify-center gap-2 py-8"><Spinner size="sm" /><span className="text-muted text-sm">{labels.loading}</span></div>}
      {isError && <div className="flex items-center justify-center gap-2 py-8 text-danger"><AlertCircle className="h-5 w-5" /><p className="text-sm">{labels.errorLoading}</p></div>}
      {!isLoading && messages.length === 0 && <div className="flex items-center justify-center py-12 text-center"><p className="text-muted text-sm">{labels.noMessages}</p></div>}
      {!isLoading && messages.length > 0 && <div className="space-y-3" ref={messageListRef}>
        {renderMessages ? renderMessages(messages, renderMessage) : groupedMessages.map((group) => <div className="space-y-3" key={String(group.date)}><DateDivider date={group.date} />{group.messages.map(renderMessage)}</div>)}
      </div>}
    </ScrollShadow>
  </div>;
}
