import { useEffect, useRef } from "react";
import { useOptionalToastState } from "../context/ToastContext";
import {
  type AttentionSoundId,
  type AttentionSoundPlayId,
  loadAttentionSound,
  playAttentionSound,
} from "../lib/attention-sound";

const DEBOUNCE_MS = 2000;

/**
 * Watches the toast stack and plays the attention sound whenever a new toast
 * appears. This anchors the audio to a visible user-visible signal (the
 * bottom-left popup) rather than the raw live-event stream, which solves the
 * "sound doesn't play" problem caused by browsers suspending AudioContext
 * until a user gesture.
 *
 * The toast itself only appears after the live event has been processed and
 * the socket is alive, so we get reliable, well-timed audio feedback.
 *
 * Renders nothing. No-ops gracefully when rendered outside a ToastProvider
 * (e.g. in isolated Layout tests).
 */
export function ToastSoundBridge() {
  const toasts = useOptionalToastState();
  const lastPlayRef = useRef<number>(0);
  const lastToastIdRef = useRef<string | null>(null);

  // Unlock AudioContext on the first user gesture so subsequent plays work.
  useEffect(() => {
    const unlock = () => {
      // Re-read the sound so the cached AudioContext gets resumed.
      const sound: AttentionSoundId = loadAttentionSound();
      if (sound !== "off") {
        playAttentionSound(sound as AttentionSoundPlayId);
      }
      window.removeEventListener("click", unlock);
      window.removeEventListener("keydown", unlock);
      window.removeEventListener("touchstart", unlock);
    };
    window.addEventListener("click", unlock, { once: true });
    window.addEventListener("keydown", unlock, { once: true });
    window.addEventListener("touchstart", unlock, { once: true });
    return () => {
      window.removeEventListener("click", unlock);
      window.removeEventListener("keydown", unlock);
      window.removeEventListener("touchstart", unlock);
    };
  }, []);

  useEffect(() => {
    if (!toasts || toasts.length === 0) return;
    const newest = toasts[0];
    if (newest.id === lastToastIdRef.current) return;
    lastToastIdRef.current = newest.id;

    const sound: AttentionSoundId = loadAttentionSound();
    if (sound === "off") return;

    const now = Date.now();
    if (now - lastPlayRef.current < DEBOUNCE_MS) return;
    lastPlayRef.current = now;

    playAttentionSound(sound as AttentionSoundPlayId);
  }, [toasts]);

  return null;
}
