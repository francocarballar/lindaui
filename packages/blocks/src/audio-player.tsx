"use client";
import { useRef, useState } from "react";
import { Play, Pause } from "lucide-react";
import { IconButton } from "@lindaui/ui/icon-button";

export interface AudioPlayerProps {
  src: string;
  durationSeconds?: number;
  playLabel?: string;
  pauseLabel?: string;
}

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

// Alturas deterministas (mismo seed que recording-overlay) — barra estática,
// no una waveform real del audio.
const BAR_HEIGHTS = Array.from({ length: 24 }, (_, i) => {
  const seed = Math.abs(Math.sin(i * 12.9898) * 43758.5453) % 1;
  return Math.max(20, Math.round((0.25 + seed * 0.75) * 100));
});

/** Reproductor de nota de voz genérico: play/pause + waveform estática + duración. */
export function AudioPlayer({
  src,
  durationSeconds,
  playLabel = "Reproducir",
  pauseLabel = "Pausar",
}: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);

  const toggle = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) audio.pause();
    else void audio.play();
  };

  return (
    <div className="flex items-center gap-2.5 rounded-full bg-secondary px-2 py-1.5">
      <audio
        ref={audioRef}
        src={src}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onEnded={() => setIsPlaying(false)}
        onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
      >
        <track kind="captions" />
      </audio>
      <IconButton
        aria-label={isPlaying ? pauseLabel : playLabel}
        onPress={toggle}
        variant="ghost"
        size="sm"
      >
        {isPlaying ? <Pause className="size-4" /> : <Play className="size-4" />}
      </IconButton>
      <div className="flex h-6 flex-1 items-end gap-[2px]" aria-hidden="true">
        {BAR_HEIGHTS.map((h, i) => (
          <span key={i} className="w-[2.5px] rounded-full bg-primary/60" style={{ height: `${h}%` }} />
        ))}
      </div>
      <span className="font-mono text-[11px] tabular-nums text-muted-foreground">
        {formatDuration(durationSeconds ?? currentTime)}
      </span>
    </div>
  );
}
