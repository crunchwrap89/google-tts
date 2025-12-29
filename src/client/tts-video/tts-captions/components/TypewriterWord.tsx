import React from "react";
import { useCurrentFrame } from "remotion";
import { WordAnimationProps } from "../../models/types";

export const TypewriterWord: React.FC<WordAnimationProps> = ({
  word,
  startFrame,
  isCurrentWord,
  baseStyle,
  wordRef,
}) => {
  const frame = useCurrentFrame();
  const timeSinceStart = frame - startFrame;

  const style = {
    ...baseStyle,
    fontFamily: "Courier New, monospace",
    position: "relative" as const,
  };

  const splitT = word.split("");
  const chars = splitT.map((char, charIndex) => {
    const charVisible = timeSinceStart >= charIndex * 2;
    return (
      <span key={charIndex} style={{ opacity: charVisible ? 1 : 0 }}>
        {char}
      </span>
    );
  });

  if (isCurrentWord) {
    const cursorVisible = Math.floor(frame / 10) % 2 === 0;
    const visibleCharsCount = splitT.filter((_, i) => timeSinceStart >= i * 2).length;

    chars.push(
      <span
        key="cursor"
        style={{
          opacity: cursorVisible ? 1 : 0,
          position: "absolute",
          left: `${visibleCharsCount}ch`,
          top: 0,
        }}
      >
        |
      </span>
    );
  }

  return <span ref={wordRef} style={style}>{chars}</span>;
};

