import React from "react";
import { interpolate, useCurrentFrame, random } from "remotion";
import { WordAnimationProps } from "../../../../common/types";

export const MatrixWord: React.FC<WordAnimationProps> = ({
  word,
  startFrame,
  globalIndex,
  baseStyle,
  wordRef,
}) => {
  const frame = useCurrentFrame();
  const timeSinceStart = frame - startFrame;

  const opacity = interpolate(timeSinceStart, [0, 5], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const style = {
    ...baseStyle,
    color: "#292c3d",
    fontFamily: "monospace",
    // eslint-disable-next-line @remotion/slow-css-property
    textShadow: "0 0 5px #00FF00",
    opacity,
  };

  const matrixChars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ@#$%^&*";

  const content = word.split("").map((char, charIndex) => {
    const resolveThreshold = charIndex * 3 + 5;

    if (timeSinceStart > resolveThreshold) {
      return <span key={charIndex}>{char}</span>;
    }

    const seed = frame + charIndex * 100 + globalIndex * 1000;
    const randIndex = Math.floor(random(seed) * matrixChars.length);

    return (
      <span key={charIndex} style={{ opacity: 0.8 }}>
        {matrixChars[randIndex]}
      </span>
    );
  });

  return <span ref={wordRef} style={style}>{content}</span>;
};

