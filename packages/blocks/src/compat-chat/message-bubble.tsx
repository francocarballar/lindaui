"use client";

import dayjs from "dayjs";
import { motion } from "framer-motion";
import { cn } from "@lindaui/ui/cn";
import { ImageLightbox } from "./image-lightbox";
import { WhatsAppAudioPlayer } from "./whatsapp-audio-player";
import type { GenericMessage } from "./types";

export interface MessageBubbleProps { message: GenericMessage; }
function formatTime(date: Date | string): string { return dayjs(date).format("HH:mm"); }
export function MessageBubble({ message }: MessageBubbleProps) {
  const isBot = message.side === "right";
  const hasAudio = message.media?.kind === "audio";
  if (message.side === "center") return <motion.div animate={{ opacity: 1 }} className="my-2 flex justify-center" initial={{ opacity: 0 }}><div className="rounded-full bg-surface-secondary px-3 py-1 text-muted text-xs">{message.text}</div></motion.div>;
  return <motion.div animate={{ opacity: 1, y: 0 }} className={cn("flex w-full", isBot ? "justify-end" : "justify-start")} initial={{ opacity: 0, y: 10 }}>
    <div className={cn("relative p-3 text-sm shadow-sm", hasAudio ? "w-[90%] max-w-[330px]" : "max-w-[85%] sm:max-w-[70%]", "rounded-2xl transition-all duration-200", isBot ? "rounded-tr-none bg-[#d9fdd3] text-[#111b21] dark:bg-[#005c4b] dark:text-white" : "rounded-tl-none bg-white text-[#111b21] dark:bg-[#202c33] dark:text-white")}>
      <div className={cn("absolute top-0 h-0 w-0 border-solid", isBot ? "-right-[12px] border-t-[#d9fdd3] border-t-[10px] border-r-[12px] border-r-transparent dark:border-t-[#005c4b]" : "-left-[12px] border-t-[10px] border-t-white border-l-[12px] border-l-transparent dark:border-t-[#202c33]")} />
      {message.media?.kind === "image" && <div className="mb-2 overflow-hidden rounded-lg"><ImageLightbox alt="Media compartida" src={message.media.url} /></div>}
      {message.media?.kind === "audio" && <div className="mb-2"><WhatsAppAudioPlayer isBot={isBot} src={message.media.url} /></div>}
      {message.media?.kind === "pdf" && <div className="mb-2"><a className="flex items-center gap-1.5 rounded-lg border border-border bg-surface-secondary px-3 py-2 text-sm text-foreground transition-colors hover:bg-surface-secondary dark:border-border dark:bg-default dark:text-muted dark:hover:bg-default" download href={message.media.url} rel="noopener noreferrer" target="_blank"><span>PDF</span><span className="max-w-[180px] truncate">{message.media.label ?? "Documento adjunto"}</span></a></div>}
      <div className="relative">
        <p className="whitespace-pre-wrap break-words">{message.text}<span className="invisible text-[10px]">{"  "}{formatTime(message.timestamp)}{message.authorTag ? ` ${message.authorTag}` : ""}</span></p>
        <span className="absolute right-0 bottom-0 flex items-center gap-1 text-[#52616b] text-[10px] dark:text-[#d1dedb]">{formatTime(message.timestamp)}{message.authorTag && <span>{message.authorTag}</span>}</span>
      </div>
    </div>
  </motion.div>;
}
