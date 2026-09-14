export type AttentionSoundId = "soft_ping" | "warm_chime" | "subtle_pop" | "off";
export type AttentionSoundPlayId = Exclude<AttentionSoundId, "off">;

const STORAGE_KEY = "paperclip:attention:sound";

export const ATTENTION_SOUND_OPTIONS: { id: AttentionSoundId; label: string; description: string }[] = [
  { id: "soft_ping", label: "Soft ping", description: "Single gentle oscillator tone, ~0.3s fade-out" },
  { id: "warm_chime", label: "Warm chime", description: "Two-note major third, warm and brief" },
  { id: "subtle_pop", label: "Subtle pop", description: "Short filtered noise burst, very understated" },
  { id: "off", label: "Off", description: "No audible alert" },
];

export function loadAttentionSound(): AttentionSoundId {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (
      raw === "soft_ping" ||
      raw === "warm_chime" ||
      raw === "subtle_pop" ||
      raw === "off"
    ) {
      return raw;
    }
    return "soft_ping";
  } catch {
    return "soft_ping";
  }
}

export function saveAttentionSound(sound: AttentionSoundId): void {
  try {
    localStorage.setItem(STORAGE_KEY, sound);
  } catch {
    // Ignore localStorage failures.
  }
}

let cachedCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (cachedCtx) return cachedCtx;
  const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Ctor) return null;
  cachedCtx = new Ctor();
  return cachedCtx;
}

/**
 * Synthesize a short, non-annoying notification sound using the Web Audio API.
 * No audio files — everything is generated on the fly so switching sounds is instant.
 *
 * Returns a promise that resolves when the sound is scheduled. If the AudioContext
 * is suspended (browser requires a user gesture), the promise resolves after resume.
 */
export function playAttentionSound(sound: AttentionSoundPlayId): Promise<void> | void {
  const ctx = getAudioContext();
  if (!ctx) return;

  // Browsers require a user gesture to start audio. If suspended, resume first
  // and schedule on the next tick so the context is running before we start.
  if (ctx.state === "suspended") {
    return ctx.resume().then(() => playAt(ctx, sound));
  }

  return playAt(ctx, sound);
}

function playAt(ctx: AudioContext, sound: AttentionSoundPlayId): void {
  const now = ctx.currentTime;

  if (sound === "soft_ping") {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(660, now);
    osc.frequency.exponentialRampToValueAtTime(440, now + 0.3);
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.18, now + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.3);
    osc.connect(gain).connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.32);
  } else if (sound === "warm_chime") {
    // Two-note major third (C5 then E5), warm and brief.
    const notes = [523.25, 659.25];
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      const start = now + i * 0.12;
      osc.frequency.setValueAtTime(freq, start);
      gain.gain.setValueAtTime(0.0001, start);
      gain.gain.exponentialRampToValueAtTime(0.15, start + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.35);
      osc.connect(gain).connect(ctx.destination);
      osc.start(start);
      osc.stop(start + 0.37);
    });
  } else if (sound === "subtle_pop") {
    // Short filtered noise burst, very understated.
    const bufferSize = Math.floor(ctx.sampleRate * 0.12);
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
    }
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    const filter = ctx.createBiquadFilter();
    filter.type = "bandpass";
    filter.frequency.setValueAtTime(1200, now);
    filter.Q.setValueAtTime(1.5, now);
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.12, now + 0.005);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.12);
    source.connect(filter).connect(gain).connect(ctx.destination);
    source.start(now);
    source.stop(now + 0.14);
  }
}
