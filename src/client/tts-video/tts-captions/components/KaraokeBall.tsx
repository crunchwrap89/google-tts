import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { Sentence } from "../utils/text-utils";

interface KaraokeBallProps {
  sentence: Sentence;
  wordCenters: number[];
  getWordStartTime: (index: number) => number;
  nextSentenceStartTime: number;
  captionColor: string;
}

export const KaraokeBall: React.FC<KaraokeBallProps> = ({
  sentence,
  wordCenters,
  getWordStartTime,
  nextSentenceStartTime,
  captionColor,
}) => {
  const frame = useCurrentFrame();

  let ballX = 0;
  let ballY = -30;
  let showBall = false;
  const jumpDuration = 5;

  for (let i = 0; i < sentence.words.length; i++) {
    const globalIndex = sentence.wordIndices[i];
    const start = getWordStartTime(globalIndex);

    let nextStart;
    if (i < sentence.words.length - 1) {
      nextStart = getWordStartTime(sentence.wordIndices[i + 1]);
    } else {
      nextStart = nextSentenceStartTime;
    }

    if (frame >= start && frame < nextStart) {
      showBall = true;
      const currentCenter = wordCenters[i];

      // Check if we are in the jump phase to the next word
      if (i < sentence.words.length - 1 && frame >= nextStart - jumpDuration) {
        const nextCenter = wordCenters[i + 1];
        const progress = (frame - (nextStart - jumpDuration)) / jumpDuration;

        ballX = interpolate(progress, [0, 1], [currentCenter, nextCenter]);

        // Parabolic arc
        const jumpHeight = 20;
        const yOffset = Math.sin(progress * Math.PI) * jumpHeight;
        ballY = -30 - yOffset;
      } else {
        // Staying on current word
        ballX = currentCenter;

        // Landing bounce effect (first 5 frames of the word)
        const timeSinceLand = frame - start;
        if (timeSinceLand < 5) {
          ballY = interpolate(timeSinceLand, [0, 5], [-50, -30], {
            extrapolateRight: "clamp",
          });
        } else {
          ballY = -30;
        }
      }
      break;
    }
  }

  if (!showBall) return null;

  return (
    <span
      style={{
        position: "absolute",
        left: ballX,
        top: ballY,
        width: 15,
        height: 15,
        borderRadius: "50%",
        backgroundColor: captionColor,
        transform: "translateX(-50%)",
        pointerEvents: "none",
        zIndex: 10,
      }}
    />
  );
};

