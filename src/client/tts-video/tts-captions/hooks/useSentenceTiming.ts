import { useCallback, useMemo } from "react";
import { useVideoConfig } from "remotion";
import { Timepoint } from "../../../../common/types";
import { splitIntoSentences } from "../utils/text-utils";

export const useSentenceTiming = (
  captionText: string,
  timepoints: Timepoint[] | undefined
) => {
  const { durationInFrames, fps } = useVideoConfig();

  const audioDurationFrames = Math.max(1, durationInFrames - 70);
  const captionTextForAnimation = captionText
    .trim()
    .split(/\s+/)
    .map((t) => ` ${t} `);
  const delayPerWord = audioDurationFrames / captionTextForAnimation.length;

  const getStartTime = useCallback(
    (index: number) => {
      const timepoint = timepoints?.find(
        (tp) => tp.markName === `word_${index}`
      );
      return timepoint
        ? Number(timepoint.timeSeconds) * fps
        : index * delayPerWord;
    },
    [delayPerWord, timepoints, fps]
  );

  const sentencesWithTiming = useMemo(() => {
    const sentences = splitIntoSentences(captionText);
    return sentences.map((s) => {
      const firstWordIndex = s.wordIndices[0];
      const startTime = getStartTime(firstWordIndex);
      return { ...s, startTime };
    });
  }, [captionText, getStartTime]);

  return {
    sentencesWithTiming,
    getStartTime,
    durationInFrames,
  };
};

