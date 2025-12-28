import { useAudioData, visualizeAudio } from "@remotion/media-utils";
import { useCurrentFrame, useVideoConfig } from "remotion";
import React, { useMemo } from "react";
import { SERVER_URL } from "../server/TextToSpeech/constants";

export type VisualizationStyle = "bars" | "wave" | "classic" | "lines";

export const AudioVisualizer: React.FC<{
  audioUrl: string;
  visualizationStyle?: VisualizationStyle;
}> = ({ audioUrl, visualizationStyle = "bars" }) => {
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

  const renderVisualization = () => {
    switch (visualizationStyle) {
      case "wave":
        return (
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              height: "200px",
              width: "100%",
              gap: "2px",
            }}
          >
            {visualization.map((v, i) => {
              const height = 300 * v;
              return (
                <div
                  key={i}
                  style={{
                    width: "100%",
                    height: `${Math.max(2, height)}px`,
                    backgroundColor: "#4285F4",
                    borderRadius: "2px",
                  }}
                />
              );
            })}
          </div>
        );
      case "classic":
        return (
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              alignItems: "flex-end",
              justifyContent: "center",
              height: "160px",
              width: "100%",
              gap: "6px",
            }}
          >
            {visualization.slice(0, 20).map((v, i) => {
              const height = 160 * Math.sqrt(v);
              const activeSegments = Math.floor(height / 8);

              return (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    flexDirection: "column-reverse",
                    gap: "2px",
                  }}
                >
                  {Array.from({ length: 20 }).map((_, j) => {
                    let color = "#4CAF50"; // Green
                    if (j > 12) color = "#FFC107"; // Yellow
                    if (j > 16) color = "#F44336"; // Red

                    return (
                      <div
                        key={j}
                        style={{
                          width: "14px",
                          height: "6px",
                          backgroundColor: color,
                          opacity: j < activeSegments ? 1 : 0.1,
                          borderRadius: "1px",
                        }}
                      />
                    );
                  })}
                </div>
              );
            })}
          </div>
        );
      case "lines":
        return (
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              height: "200px",
              width: "100%",
              gap: "4px",
            }}
          >
            {[...visualization].reverse().concat(visualization).map((v, i) => {
              const height = 400 * v;
              return (
                <div
                  key={i}
                  style={{
                    width: "2px",
                    height: `${Math.max(4, height)}px`,
                    backgroundColor: "#2E8AEA",
                  }}
                />
              );
            })}
          </div>
        );
      case "bars":
      default: {
        const mirroredVisualization = [
          ...[...visualization].reverse(),
          ...visualization,
        ];
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
                    background:
                      "linear-gradient(180deg, #4285F4 0%, #a6c8ff 100%)",
                    borderRadius: "10px",
                    // eslint-disable-next-line @remotion/slow-css-property
                    boxShadow: `0 0 ${height / 5}px rgba(66, 133, 244, 0.6)`,
                  }}
                />
              );
            })}
          </div>
        );
      }
    }
  };

  return (
    <div
      style={{
        position: "absolute",
        bottom: "300px",
        width: "100%",
        display: "flex",
        justifyContent: "center",
      }}
    >
      {renderVisualization()}
    </div>
  );
};
