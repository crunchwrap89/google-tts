import {
  Html5Audio,
  useVideoConfig,
} from "remotion";
import { SERVER_URL } from "../server/TextToSpeech/constants";
import { RequestMetadata } from "../lib/interfaces";
import { AudioVisualizer } from "./AudioVisualizer";
import { splitIntoSentences } from "../lib/text-utils";
import React, { useCallback, useMemo } from "react";
import { SyncStatus } from "./SyncStatus";
import { SentenceRenderer } from "./SentenceRenderer";

export const Captions: React.FC<RequestMetadata> = (props) => {
  const { captionText, captionColor, timepoints, debug = false } = props;
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
      {debug && <SyncStatus isSynced={!!(timepoints && timepoints.length > 0)} />}

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
