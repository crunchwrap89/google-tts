import { z } from "zod";
import { zColor } from "@remotion/zod-types";
import { VoiceType } from "./types";
import { VOICES } from "./const";

export const mySchema = z.object({
  captionText: z.string(),
  captionColor: zColor(),
  voice: z.enum(
    Object.keys(VOICES) as [VoiceType, ...VoiceType[]],
  ),
  pitch: z.coerce.number().min(-20).max(20),
  speakingRate: z.coerce.number().min(0.25).max(4),
  audioUrl: z.string().or(z.null()),
  ssml: z.string().optional(),
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
  codeBlocks: z
    .array(
      z.object({
        language: z.string(),
        content: z.string(),
        startTime: z.number(),
        duration: z.number(),
      }),
    )
    .optional(),
});

