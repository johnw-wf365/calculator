import { useState } from "react";
import { Volume2, VolumeX } from "lucide-react";
import {
  ATTENTION_SOUND_OPTIONS,
  type AttentionSoundId,
  loadAttentionSound,
  playAttentionSound,
  saveAttentionSound,
} from "../lib/attention-sound";
import { Button } from "./ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";

/**
 * Sound picker popover for attention notifications. Shared by the Decisions
 * toolbar and the Inbox toolbar so the mute/sound control is reachable from
 * both surfaces.
 */
export function AttentionSoundPopover() {
  const [sound, setSound] = useState<AttentionSoundId>(() => loadAttentionSound());
  const isMuted = sound === "off";

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="h-8 w-8 shrink-0"
          title={isMuted ? "Sound off" : `Sound: ${sound}`}
          aria-label={isMuted ? "Sound off" : `Sound: ${sound}`}
        >
          {isMuted ? <VolumeX className="h-3.5 w-3.5" /> : <Volume2 className="h-3.5 w-3.5" />}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-56 p-2">
        <p className="px-2 pb-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Notification sound
        </p>
        <div className="space-y-0.5">
          {ATTENTION_SOUND_OPTIONS.map((opt) => (
            <button
              key={opt.id}
              type="button"
              className={
                "flex w-full items-center justify-between rounded-sm px-2 py-1.5 text-sm " +
                (sound === opt.id
                  ? "bg-accent/50 text-foreground"
                  : "text-muted-foreground hover:bg-accent/50")
              }
              onClick={() => {
                setSound(opt.id);
                saveAttentionSound(opt.id);
                if (opt.id !== "off") {
                  playAttentionSound(opt.id as Exclude<AttentionSoundId, "off">);
                }
              }}
            >
              <span>{opt.label}</span>
              {sound === opt.id ? <Volume2 className="h-3.5 w-3.5" /> : null}
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}
