import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { Sentence } from "../lib/text-utils";

export const SentenceRenderer: React.FC<{
  sentence: Sentence & { startTime: number };
  nextSentenceStartTime: number;
  getWordStartTime: (index: number) => number;
  captionColor: string;
}> = ({ sentence, nextSentenceStartTime, getWordStartTime, captionColor }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Show sentence until next one starts
  if (frame < sentence.startTime || frame >= nextSentenceStartTime) {
    return null;
  }

  // Fade out in the last 10 frames before the next sentence
  const opacity = interpolate(
    frame,
    [nextSentenceStartTime - 10, nextSentenceStartTime],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  return (
    <p
      style={{
        fontFamily: "SF Pro Text, Helvetica, Arial",
        fontWeight: "bold",
        fontSize: 60,
        textAlign: "center",
        position: "absolute",
        bottom: 100,
        width: "100%",
        paddingLeft: 50,
        paddingRight: 50,
        margin: 0,
        opacity,
      }}
    >
      {sentence.words.map((t, i) => {
        const globalIndex = sentence.wordIndices[i];
        const startFrame = getWordStartTime(globalIndex);

        return (
          <span
            key={`${globalIndex}-${t}`}
            style={{
              color: captionColor,
              marginLeft: 8,
              marginRight: 8,
              transform: `scale(${spring({
                fps,
                frame: frame - startFrame,
                config: {
                  damping: 100,
                  stiffness: 200,
                  mass: 0.5,
                },
              })})`,
              display: "inline-block",
            }}
          >
            {t}
          </span>
        );
      })}
    </p>
  );
};

