import React from "react";
import { VisualizerProps } from "./types";

export const BarsVisualizer: React.FC<VisualizerProps> = ({ visualization }) => {
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
};

