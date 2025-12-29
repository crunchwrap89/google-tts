import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { Sentence } from "../utils/text-utils";
import { useWordMeasurements } from "../hooks/useWordMeasurements";
import { KaraokeBall } from "./KaraokeBall";
import { WordRenderer } from "./WordRenderer";

export const SentenceRenderer: React.FC<{
  sentence: Sentence & { startTime: number };
  nextSentenceStartTime: number;
  getWordStartTime: (index: number) => number;
  captionColor: string;
  animationStyle?: "pop" | "karaoke" | "typewriter" | "matrix";
}> = ({
  sentence,
  nextSentenceStartTime,
  getWordStartTime,
  captionColor,
  animationStyle = "pop",
}) => {
  const frame = useCurrentFrame();

  const isVisible =
    frame >= sentence.startTime && frame < nextSentenceStartTime;

  const { containerRef, wordRefs, wordCenters, measurementsDone } =
    useWordMeasurements(
      animationStyle === "karaoke" && isVisible,
      sentence.words.length
    );

  // Show sentence until next one starts
  if (!isVisible) {
    return null;
  }

  // Fade out in the last 10 frames before the next sentence
  const opacity = interpolate(
    frame,
    [nextSentenceStartTime - 10, nextSentenceStartTime],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  return (
    <p
      ref={containerRef}
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

        // Determine word end frame
        let wordEndFrame;
        if (i < sentence.words.length - 1) {
          const nextGlobalIndex = sentence.wordIndices[i + 1];
          wordEndFrame = getWordStartTime(nextGlobalIndex);
        } else {
          wordEndFrame = nextSentenceStartTime;
        }

        // Determine if this is the current word being typed or waiting
        const isCurrentWord = frame >= startFrame && frame < wordEndFrame;

        return (
          <WordRenderer
            key={`${globalIndex}-${t}`}
            word={t}
            globalIndex={globalIndex}
            startFrame={startFrame}
            captionColor={captionColor}
            animationStyle={animationStyle}
            isCurrentWord={isCurrentWord}
            wordRef={(el) => {
              wordRefs.current[i] = el;
            }}
          />
        );
      })}
      {animationStyle === "karaoke" && measurementsDone && (
        <KaraokeBall
          sentence={sentence}
          wordCenters={wordCenters}
          getWordStartTime={getWordStartTime}
          nextSentenceStartTime={nextSentenceStartTime}
          captionColor={captionColor}
        />
      )}
    </p>
  );
};



