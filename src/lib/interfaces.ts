import { z } from "zod";
import { mySchema } from "../TTSVideo";
import { voices } from "../server/TextToSpeech/constants";

export interface Timepoint {
  markName: string;
  timeSeconds: number;
}

export type ServerResponse =
  | {
      type: "success";
      url: string;
      timepoints: Timepoint[];
    }
  | {
      type: "error";
      error: string;
    };
export type VoiceType = keyof typeof voices;
export type RequestMetadata = z.infer<typeof mySchema>;
