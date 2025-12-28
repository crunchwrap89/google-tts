import React from "react";
import { spring, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { WordAnimationProps } from "./types";

export const PopWord: React.FC<WordAnimationProps> = ({
  word,
  startFrame,
  baseStyle,
  wordRef,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const timeSinceStart = frame - startFrame;

  const content = word.split("").map((char, charIndex) => {
    const delay = charIndex * 1.5;
    const charTime = timeSinceStart - delay;

    const scale = spring({
      fps,
      frame: charTime,
      config: { damping: 10, stiffness: 200, mass: 0.5 },
    });

    const opacity = interpolate(charTime, [0, 2], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });

    return (
      <span
        key={charIndex}
        style={{
          display: "inline-block",
          opacity,
          transform: `scale(${scale})`,
        }}
      >
        {char}
      </span>
    );
  });

  return <span ref={wordRef} style={baseStyle}>{content}</span>;
};

