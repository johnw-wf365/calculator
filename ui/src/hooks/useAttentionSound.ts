import { useEffect, useRef } from "react";
import { useCompanyLiveEvent } from "@/context/LiveUpdatesProvider";
import { useQuery } from "@tanstack/react-query";
import { authApi } from "../api/auth";
import { queryKeys } from "../lib/queryKeys";
import {
  type AttentionSoundId,
  type AttentionSoundPlayId,
  loadAttentionSound,
  playAttentionSound,
} from "../lib/attention-sound";

const DEBOUNCE_MS = 2000;

/**
 * Actions that produce new attention items and are worth notifying about.
 * Mirrors the set that drives toasts in LiveUpdatesProvider.
 */
const ATTENTION_ACTIONS = new Set([
  "issue.created",
  "issue.updated",
  "issue.comment_added",
  "issue.thread_interaction_created",
  "approval.created",
]);

/**
 * Subscribes to the shared live-event socket and plays the selected attention
 * sound when an attention-worthy activity arrives from *someone else*. Debounced
 * to at most one play per DEBOUNCE_MS so a burst doesn't machine-gun your speaker.
 *
 * Call once near the top of a page (e.g. WhatNeedsMe). The hook is self-contained
 * and re-reads the persisted sound on every fire, so changing the sound in the
 * toolbar takes effect immediately.
 */
export function useAttentionSound(): void {
  const lastPlayRef = useRef<number>(0);
  const { data: session } = useQuery({
    queryKey: queryKeys.auth.session,
    queryFn: () => authApi.getSession(),
    retry: false,
  });
  const currentUserId = session?.user?.id ?? session?.session?.userId ?? null;

  // Unlock AudioContext on the first user gesture so subsequent plays work
  // even if the first event arrives before any interaction (browsers require a
  // gesture before audio can start). Mirrors ToastSoundBridge's unlock path.
  useEffect(() => {
    const unlock = () => {
      const sound: AttentionSoundId = loadAttentionSound();
      if (sound !== "off") {
        void playAttentionSound(sound as AttentionSoundPlayId);
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

  useCompanyLiveEvent((event) => {
    if (event.type !== "activity.logged") return;
    const payload = event.payload ?? {};
    const action = typeof payload.action === "string" ? payload.action : "";
    if (!ATTENTION_ACTIONS.has(action)) return;

    // Don't notify the user about their own actions.
    const actorType = typeof payload.actorType === "string" ? payload.actorType : "";
    const actorId = typeof payload.actorId === "string" ? payload.actorId : "";
    if (actorType === "user" && actorId && actorId === currentUserId) return;

    const sound: AttentionSoundId = loadAttentionSound();
    if (sound === "off") return;

    const now = Date.now();
    if (now - lastPlayRef.current < DEBOUNCE_MS) return;
    lastPlayRef.current = now;

    playAttentionSound(sound as AttentionSoundPlayId);
  });
}
