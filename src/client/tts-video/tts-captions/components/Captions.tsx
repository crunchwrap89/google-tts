import { RequestMetadata } from "../../../../common/types";
import React from "react";
import { SentenceRenderer } from "./SentenceRenderer";
import { useSentenceTiming } from "../hooks/useSentenceTiming";

export const Captions: React.FC<RequestMetadata> = (props) => {
  const {
    captionText,
    captionColor,
    timepoints,
    animationStyle = "pop",
  } = props;

  const { sentencesWithTiming, getStartTime, durationInFrames } = useSentenceTiming(captionText, timepoints);

  return (
    <>
      {sentencesWithTiming.map((sentence, index) => {
        const nextSentenceStartTime =
          sentencesWithTiming[index + 1]?.startTime ?? durationInFrames;

        return (
          <SentenceRenderer
            key={index}
            sentence={sentence}
            nextSentenceStartTime={nextSentenceStartTime}
            getWordStartTime={getStartTime}
            captionColor={captionColor}
            animationStyle={animationStyle}
          />
        );
      })}
    </>
  );
};
