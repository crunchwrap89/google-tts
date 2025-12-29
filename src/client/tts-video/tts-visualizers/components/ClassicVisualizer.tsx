import React from "react";
import { VisualizerProps } from "../../../../common/types";

export const ClassicVisualizer: React.FC<VisualizerProps> = ({ visualization }) => {
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
};

