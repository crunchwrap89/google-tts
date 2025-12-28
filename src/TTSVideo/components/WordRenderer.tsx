import React from "react";
import { PopWord } from "./word-animations/PopWord";
import { KaraokeWord } from "./word-animations/KaraokeWord";
import { TypewriterWord } from "./word-animations/TypewriterWord";
import { MatrixWord } from "./word-animations/MatrixWord";
import { WordAnimationProps } from "./word-animations/types";

interface WordRendererProps {
  word: string;
  globalIndex: number; // global index in text
  startFrame: number;
  captionColor: string;
  animationStyle: "pop" | "karaoke" | "typewriter" | "matrix";
  isCurrentWord: boolean;
  wordRef?: (el: HTMLSpanElement | null) => void;
}

export const WordRenderer: React.FC<WordRendererProps> = (props) => {
  const {
    captionColor,
    animationStyle,
  } = props;

  const baseStyle: React.CSSProperties = {
    color: captionColor,
    marginLeft: 8,
    marginRight: 8,
    display: "inline-block",
  };

  const animationProps: WordAnimationProps = {
    ...props,
    baseStyle,
  };

  switch (animationStyle) {
    case "pop":
      return <PopWord {...animationProps} />;
    case "karaoke":
      return <KaraokeWord {...animationProps} />;
    case "typewriter":
      return <TypewriterWord {...animationProps} />;
    case "matrix":
      return <MatrixWord {...animationProps} />;
    default:
      return <PopWord {...animationProps} />;
  }
};



