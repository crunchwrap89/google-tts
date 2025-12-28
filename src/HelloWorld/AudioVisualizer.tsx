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
      numberOfSamples: 32,
    });
  }, [fps, frame, audioData]);

  if (!audioData) {
    return null;
  }

  // Mirror the visualization: high -> low | low -> high
  const mirroredVisualization = [...[...visualization].reverse(), ...visualization];

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "row",
        gap: "6px",
        alignItems: "center",
        justifyContent: "center",
        height: "200px",
        width: "100%",
        position: "absolute",
        bottom: "500px",
      }}
    >
      {mirroredVisualization.map((v, i) => {
        const height = 500 * Math.sqrt(v); // Sqrt to boost smaller values
        return (
          <div
            key={i}
            style={{
              width: "10px",
              height: `${Math.max(8, height)}px`,
              background: "linear-gradient(180deg, #4285F4 0%, #a6c8ff 100%)",
              borderRadius: "10px",
              boxShadow: `0 0 ${height / 5}px rgba(66, 133, 244, 0.6)`,
            }}
          />
        );
      })}
    </div>
  );
};
