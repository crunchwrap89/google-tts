import React from "react";
import { VisualizerProps } from "../../models/types";

export const WaveVisualizer: React.FC<VisualizerProps> = ({ visualization }) => {
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
};

