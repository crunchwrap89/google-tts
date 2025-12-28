import {
  Html5Audio,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { SERVER_URL } from "../server/TextToSpeech/constants";
import { RequestMetadata } from "../lib/interfaces";
import { AudioVisualizer } from "./AudioVisualizer";
import { Sentence, splitIntoSentences } from "../lib/text-utils";
import React, { useCallback, useMemo } from "react";


const SentenceRenderer: React.FC<{
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

export const Text: React.FC<RequestMetadata> = (props) => {
  const { captionText, captionColor, timepoints } = props;
  const videoConfig = useVideoConfig();

  const audioDurationFrames = Math.max(1, videoConfig.durationInFrames - 70);
  const captionTextForAnimation = captionText
    .trim()
    .split(/\s+/)
    .map((t) => ` ${t} `);
  const delayPerWord = audioDurationFrames / captionTextForAnimation.length;

  const proxiedUrl = props.audioUrl
    ? `${SERVER_URL}/proxy?url=${encodeURIComponent(props.audioUrl)}`
    : null;

  if (!timepoints || timepoints.length === 0) {
    console.warn("No timepoints available for text animation sync.");
  }

  const getStartTime = useCallback((index: number) => {
    const timepoint = timepoints?.find((tp) => tp.markName === `word_${index}`);
    return timepoint
      ? Number(timepoint.timeSeconds) * videoConfig.fps
      : index * delayPerWord;
  }, [delayPerWord, timepoints, videoConfig.fps]);

  const sentencesWithTiming = useMemo(() => {
    const sentences = splitIntoSentences(captionText);
    return sentences.map((s) => {
      const firstWordIndex = s.wordIndices[0];
      const startTime = getStartTime(firstWordIndex);
      return { ...s, startTime };
    });
  }, [captionText, getStartTime]);

  return (
    <>
      {proxiedUrl && (
        <Html5Audio id="TTS Audio" about="TTS Audio" src={proxiedUrl} />
      )}

      {proxiedUrl && <AudioVisualizer audioUrl={props.audioUrl!} />}

      {sentencesWithTiming.map((sentence, index) => {
        const nextSentenceStartTime =
          sentencesWithTiming[index + 1]?.startTime ??
          videoConfig.durationInFrames;

        return (
          <SentenceRenderer
            key={index}
            sentence={sentence}
            nextSentenceStartTime={nextSentenceStartTime}
            getWordStartTime={getStartTime}
            captionColor={captionColor}
          />
        );
      })}
    </>
  );
};
