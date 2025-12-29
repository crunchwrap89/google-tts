import { z } from "zod";
import { TTSConst } from "../server/tts/const/TTSConst";
import { mySchema } from "./schema";

export type Timepoint = {
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
export type VoiceType = keyof typeof TTSConst.voices;
export type RequestMetadata = z.infer<typeof mySchema>;
