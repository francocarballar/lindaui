"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

export interface WhatsAppAudioPlayerProps { isBot?: boolean; src: string; }

/** URL-seeded waveform: deterministic across renders and server/client. */
function generateWaveform(seed: string, count = 60): number[] {
  let h = 0;
  for (let i = 0; i < seed.length; i += 1) h = (Math.imul(31, h) + seed.charCodeAt(i)) | 0;
  return Array.from({ length: count }, () => {
    h = (Math.imul(1_664_525, h) + 1_013_904_223) | 0;
    return 0.12 + ((h >>> 0) / 4_294_967_295) * 0.88;
  });
}
function formatSeconds(s: number): string {
  if (!Number.isFinite(s) || s < 0) return "0:00";
  return `${Math.floor(s / 60)}:${Math.floor(s % 60).toString().padStart(2, "0")}`;
}
function MicIcon({ color }: { color: string }) {
  return <svg aria-hidden="true" fill={color} focusable="false" height="18" role="img" viewBox="0 0 24 24" width="18" xmlns="http://www.w3.org/2000/svg"><title>Micrófono</title><path d="M12 1a4 4 0 0 1 4 4v7a4 4 0 0 1-8 0V5a4 4 0 0 1 4-4zm0 2a2 2 0 0 0-2 2v7a2 2 0 1 0 4 0V5a2 2 0 0 0-2-2zm-7 8a1 1 0 0 1 .993.883L6 12a6 6 0 0 0 11.996.2L18 12a1 1 0 0 1 2 0 8 8 0 0 1-7 7.938V21h2a1 1 0 0 1 0 2H9a1 1 0 0 1 0-2h2v-1.062A8 8 0 0 1 4 12a1 1 0 0 1 1-1z" /></svg>;
}
function PlayIcon({ color }: { color: string }) { return <svg aria-hidden="true" fill={color} focusable="false" height="16" role="img" viewBox="0 0 24 24" width="16"><title>Reproducir</title><path d="M8 5.14v14l11-7-11-7z" /></svg>; }
function PauseIcon({ color }: { color: string }) { return <svg aria-hidden="true" fill={color} focusable="false" height="16" role="img" viewBox="0 0 24 24" width="16"><title>Pausar</title><rect height="14" rx="1.5" width="4" x="6" y="5" /><rect height="14" rx="1.5" width="4" x="14" y="5" /></svg>; }
function SpinnerIcon({ color }: { color: string }) { return <svg aria-hidden="true" className="animate-spin" fill="none" focusable="false" height="16" role="img" stroke={color} strokeWidth="2.5" viewBox="0 0 24 24" width="16"><title>Cargando</title><circle className="opacity-25" cx="12" cy="12" r="10" stroke={color} /><path className="opacity-75" d="M4 12a8 8 0 018-8" stroke={color} /></svg>; }
function ButtonIcon({ isLoading, isPlaying, color }: { isLoading: boolean; isPlaying: boolean; color: string }) {
  if (isLoading) return <SpinnerIcon color={color} />;
  return isPlaying ? <PauseIcon color={color} /> : <PlayIcon color={color} />;
}

/** Voice-note playback, buffering, duration tracking and click-to-seek. */
export function WhatsAppAudioPlayer({ src, isBot = false }: WhatsAppAudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const bars = useMemo(() => generateWaveform(src), [src]);
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const onTimeUpdate = () => { setCurrentTime(audio.currentTime); setProgress(audio.duration > 0 ? audio.currentTime / audio.duration : 0); };
    const onDurationChange = () => { if (Number.isFinite(audio.duration)) setDuration(audio.duration); };
    const onEnded = () => { setIsPlaying(false); setProgress(0); setCurrentTime(0); audio.currentTime = 0; };
    const onWaiting = () => setIsLoading(true);
    const onCanPlay = () => setIsLoading(false);
    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.addEventListener("durationchange", onDurationChange);
    audio.addEventListener("loadedmetadata", onDurationChange);
    audio.addEventListener("ended", onEnded);
    audio.addEventListener("waiting", onWaiting);
    audio.addEventListener("canplay", onCanPlay);
    audio.addEventListener("play", onPlay);
    audio.addEventListener("pause", onPause);
    return () => {
      audio.removeEventListener("timeupdate", onTimeUpdate);
      audio.removeEventListener("durationchange", onDurationChange);
      audio.removeEventListener("loadedmetadata", onDurationChange);
      audio.removeEventListener("ended", onEnded);
      audio.removeEventListener("waiting", onWaiting);
      audio.removeEventListener("canplay", onCanPlay);
      audio.removeEventListener("play", onPlay);
      audio.removeEventListener("pause", onPause);
    };
  }, []);
  const togglePlay = useCallback(async () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) audio.pause();
    else await audio.play();
  }, [isPlaying]);
  const handleWaveformClick = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    const audio = audioRef.current;
    if (!audio || !Number.isFinite(audio.duration)) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    audio.currentTime = ratio * audio.duration;
    setProgress(ratio);
  }, []);
  const colors = isBot ? {
    barPlayed: "rgba(255,255,255,0.9)", barUnplayed: "rgba(255,255,255,0.32)", btnBg: "rgba(0,0,0,0.15)", btnIcon: "#ffffff", micBg: "rgba(0,0,0,0.12)", micIcon: "rgba(255,255,255,0.85)", timer: "rgba(255,255,255,0.7)",
  } : {
    barPlayed: "#00a884", barUnplayed: "#c8d3d8", btnBg: "#00a884", btnIcon: "#ffffff", micBg: "#d9fdd3", micIcon: "#00a884", timer: "#8696a0",
  };
  const displayTime = isPlaying || progress > 0 ? currentTime : duration;
  return <div className="flex w-full items-center gap-2 py-0.5 sm:min-w-[440px]">
    <audio preload="metadata" ref={audioRef} src={src} />
    <div aria-hidden="true" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full" style={{ backgroundColor: colors.micBg }}><MicIcon color={colors.micIcon} /></div>
    <button aria-label={isPlaying ? "Pausar audio" : "Reproducir audio"} className="flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-full transition-opacity hover:opacity-80 active:scale-95 focus:outline-none focus:ring-2 focus:ring-offset-1" onClick={togglePlay} style={{ backgroundColor: colors.btnBg }} type="button"><ButtonIcon color={colors.btnIcon} isLoading={isLoading} isPlaying={isPlaying} /></button>
    <div className="flex min-w-0 flex-1 flex-col gap-1">
      <button aria-label="Cambiar posición del audio" className="flex h-8 w-full items-center gap-[2px] focus:outline-none" onClick={handleWaveformClick} type="button">
        {bars.map((height, i) => <span className="rounded-full transition-colors duration-75" key={i} style={{ backgroundColor: i / bars.length < progress ? colors.barPlayed : colors.barUnplayed, flex: "1", height: `${Math.round(height * 28)}px`, maxHeight: "28px", minHeight: "3px", width: "2px" }} />)}
      </button>
      <span className="select-none text-[10px] leading-none tabular-nums" style={{ color: colors.timer }}>{formatSeconds(displayTime)}</span>
    </div>
  </div>;
}
