import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AudioPlayer } from "./audio-player";
import { describe, test, expect, vi, beforeAll } from "vitest";

beforeAll(() => {
  HTMLMediaElement.prototype.play = vi.fn().mockResolvedValue(undefined);
  HTMLMediaElement.prototype.pause = vi.fn();
});

describe("AudioPlayer", () => {
  test("pauses playback, shows elapsed time, and resets after ending", async () => {
    const { container } = render(<AudioPlayer src="https://example.test/audio.mp3" />);
    const audio = container.querySelector("audio")!;
    fireEvent.play(audio);
    await userEvent.click(screen.getByRole("button", { name: "Pausar" }));
    expect(HTMLMediaElement.prototype.pause).toHaveBeenCalled();
    fireEvent.pause(audio);
    expect(screen.getByRole("button", { name: "Reproducir" })).toBeInTheDocument();
    audio.currentTime = 65;
    fireEvent.timeUpdate(audio);
    expect(screen.getByText("01:05")).toBeInTheDocument();
    fireEvent.play(audio);
    fireEvent.ended(audio);
    expect(screen.getByRole("button", { name: "Reproducir" })).toBeInTheDocument();
  });
  test("renders a fixed duration when provided", () => {
    render(<AudioPlayer src="https://example.com/a.mp3" durationSeconds={90} />);
    expect(screen.getByText("01:30")).toBeInTheDocument();
  });

  test("toggles play/pause label and calls the media element", async () => {
    render(<AudioPlayer src="https://example.com/a.mp3" durationSeconds={5} />);
    const button = screen.getByRole("button", { name: "Reproducir" });
    await userEvent.click(button);
    expect(HTMLMediaElement.prototype.play).toHaveBeenCalledTimes(1);
  });

  test("switches to the pause label once playback starts", () => {
    render(<AudioPlayer src="https://example.com/a.mp3" durationSeconds={5} />);
    const audio = document.querySelector("audio")!;
    fireEvent.play(audio);
    expect(screen.getByRole("button", { name: "Pausar" })).toBeInTheDocument();
  });
});
