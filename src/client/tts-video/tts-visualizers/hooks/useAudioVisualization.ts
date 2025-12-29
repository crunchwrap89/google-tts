import { useAudioData, visualizeAudio } from "@remotion/media-utils";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { useMemo } from "react";
import { TTSConst } from "../../../../server/tts/const/TTSConst";
import { DEFAULT_NUMBER_OF_SAMPLES } from "../utils/constants";

export const useAudioVisualization = (audioUrl: string, numberOfSamples: number = DEFAULT_NUMBER_OF_SAMPLES) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const proxiedUrl = `${TTSConst.SERVER_URL}/proxy?url=${encodeURIComponent(audioUrl)}`;
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

