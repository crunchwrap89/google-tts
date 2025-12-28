import { useAudioData, visualizeAudio } from "@remotion/media-utils";
import { useCurrentFrame, useVideoConfig } from "remotion";
import React, { useMemo } from "react";
import { SERVER_URL } from "../server/TextToSpeech/constants";

export const AudioVisualizer: React.FC<{ audioUrl: string }> = ({ audioUrl }) => {
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
      numberOfSamples: 32, // Number of bars
    });
  }, [fps, frame, audioData]);

  if (!audioData) {
    return null;
  }

  return (
    <div style={{
        display: "flex",
        flexDirection: "row",
        gap: "6px",
        alignItems: "flex-end",
        justifyContent: "center",
        height: "150px",
        width: "100%",
        position: "absolute",
        bottom: "300px"
    }}>
      {visualization.map((v, i) => {
        return (
          <div
            key={i}
            style={{
              width: "15px",
              height: `${500 * v}px`,
              backgroundColor: "#4285F4",
              borderRadius: "4px",
            }}
          />
        );
      })}
    </div>
  );
};
