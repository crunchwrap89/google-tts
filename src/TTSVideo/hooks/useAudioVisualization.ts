import { useAudioData, visualizeAudio } from "@remotion/media-utils";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { useMemo } from "react";
import { SERVER_URL } from "../../server/TextToSpeech/constants";

export const useAudioVisualization = (audioUrl: string, numberOfSamples: number = 32) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const proxiedUrl = `${SERVER_URL}/proxy?url=${encodeURIComponent(audioUrl)}`;
  const audioData = useAudioData(proxiedUrl);

  const visualization = useMemo(() => {
    if (!audioData) return [];
    return visualizeAudio({
      fps,
      frame,
      audioData,
      numberOfSamples,
    });
  }, [fps, frame, audioData, numberOfSamples]);

  return { visualization, audioData };
};

