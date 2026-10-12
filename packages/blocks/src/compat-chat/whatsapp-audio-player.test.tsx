import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { WhatsAppAudioPlayer } from "./whatsapp-audio-player";

afterEach(() => vi.restoreAllMocks());
describe("compatibility voice-note player", () => {
  it("retains deterministic waveform, playback, seeking, buffering and end reset", () => {
    vi.spyOn(HTMLMediaElement.prototype, "play").mockImplementation(function (this: HTMLMediaElement) { this.dispatchEvent(new Event("play")); return Promise.resolve(); });
    vi.spyOn(HTMLMediaElement.prototype, "pause").mockImplementation(function (this: HTMLMediaElement) { this.dispatchEvent(new Event("pause")); });
    const { container, rerender, unmount } = render(<WhatsAppAudioPlayer src="/voice.ogg" />);
    const audio = container.querySelector("audio")!;
    Object.defineProperty(audio, "duration", { value: 120, configurable: true });
    fireEvent.loadedMetadata(audio);
    expect(screen.getByText("2:00")).toBeInTheDocument();
    const seek = screen.getByRole("button", { name: "Cambiar posición del audio" });
    expect(seek.children).toHaveLength(60);
    const heights = [...seek.children].map((bar) => (bar as HTMLElement).style.height);
    rerender(<WhatsAppAudioPlayer src="/voice.ogg" isBot />);
    expect([...seek.children].map((bar) => (bar as HTMLElement).style.height)).toEqual(heights);
    fireEvent.click(screen.getByRole("button", { name: "Reproducir audio" }));
    expect(screen.getByRole("button", { name: "Pausar audio" })).toBeInTheDocument();
    fireEvent.waiting(audio);
    expect(container.querySelector("svg.animate-spin")).toBeInTheDocument();
    fireEvent.canPlay(audio);
    expect(container.querySelector("svg.animate-spin")).toBeNull();
    vi.spyOn(seek, "getBoundingClientRect").mockReturnValue({ left: 0, width: 100 } as DOMRect);
    fireEvent.click(seek, { clientX: 25 });
    expect(audio.currentTime).toBe(30);
    fireEvent.timeUpdate(audio);
    expect(screen.getByText("0:30")).toBeInTheDocument();
    fireEvent.ended(audio);
    expect(audio.currentTime).toBe(0);
    expect(screen.getByRole("button", { name: "Reproducir audio" })).toBeInTheDocument();
    const remove = vi.spyOn(audio, "removeEventListener");
    unmount();
    expect(remove).toHaveBeenCalledWith("timeupdate", expect.any(Function));
    expect(remove).toHaveBeenCalledWith("waiting", expect.any(Function));
  });
});
