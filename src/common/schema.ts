import { z } from "zod";
import { zColor } from "@remotion/zod-types";
import { TTSConst } from "../server/tts/const/TTSConst";

type VoiceType = keyof typeof TTSConst.voices;

export const mySchema = z.object({
  captionText: z.string(),
  captionColor: zColor(),
  voice: z.enum(
    Object.keys(TTSConst.voices) as [VoiceType, ...VoiceType[]],
  ),
  pitch: z.coerce.number().min(-20).max(20),
  speakingRate: z.coerce.number().min(0.25).max(4),
  audioUrl: z.string().or(z.null()),
  timepoints: z
    .array(
      z.object({
        markName: z.string(),
        timeSeconds: z.number(),
      }),
    )
    .optional(),
  debug: z.boolean().optional(),
  animationStyle: z
    .enum(["pop", "karaoke", "typewriter", "matrix"])
    .optional(),
  visualizationStyle: z
    .enum(["bars", "wave", "classic", "lines"])
    .optional(),
});

