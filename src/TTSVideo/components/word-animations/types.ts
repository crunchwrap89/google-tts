import { CSSProperties } from "react";

export interface WordAnimationProps {
  word: string;
  globalIndex: number;
  startFrame: number;
  captionColor: string;
  isCurrentWord: boolean;
  wordRef?: (el: HTMLSpanElement | null) => void;
  baseStyle: CSSProperties;
}

