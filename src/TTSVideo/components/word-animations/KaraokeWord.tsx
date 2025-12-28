import React from "react";
import { useCurrentFrame } from "remotion";
import { WordAnimationProps } from "./types";

export const KaraokeWord: React.FC<WordAnimationProps> = ({
  word,
  startFrame,
  captionColor,
  baseStyle,
  wordRef,
}) => {
  const frame = useCurrentFrame();
  const isFuture = frame < startFrame;

  const style = {
    ...baseStyle,
    position: "relative" as const,
    color: isFuture ? "#cccccc" : captionColor,
  };

  return <span ref={wordRef} style={style}>{word}</span>;
};

