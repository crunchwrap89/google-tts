import React from "react";
import { PopWord } from "./PopWord";
import { KaraokeWord } from "./KaraokeWord";
import { TypewriterWord } from "./TypewriterWord";
import { MatrixWord } from "./MatrixWord";
import { WordAnimationProps, WordRendererProps } from "../../../../common/types";

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



