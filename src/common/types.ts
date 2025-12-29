import { z } from "zod";
import { CSSProperties } from "react";
import { mySchema } from "./schema";
import { VOICES } from "./const";

export type Timepoint = {
  markName: string;
  timeSeconds: number;
}

export type VoiceType = keyof typeof VOICES;
export type VisualizationStyle = "bars" | "wave" | "classic" | "lines";

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
export type RequestMetadata = z.infer<typeof mySchema>;

export type Sentence = {
  words: string[];
  wordIndices: number[];
}

export type KaraokeBallProps = {
  sentence: Sentence;
  wordCenters: number[];
  getWordStartTime: (index: number) => number;
  nextSentenceStartTime: number;
  captionColor: string;
}

export type WordRendererProps = {
  word: string;
  globalIndex: number; // global index in text
  startFrame: number;
  captionColor: string;
  animationStyle: "pop" | "karaoke" | "typewriter" | "matrix";
  isCurrentWord: boolean;
  wordRef?: (el: HTMLSpanElement | null) => void;
};

export type WordAnimationProps = {
  word: string;
  globalIndex: number;
  startFrame: number;
  captionColor: string;
  isCurrentWord: boolean;
  wordRef?: (el: HTMLSpanElement | null) => void;
  baseStyle: CSSProperties;
}

export type VisualizerProps = {
  visualization: number[];
}




