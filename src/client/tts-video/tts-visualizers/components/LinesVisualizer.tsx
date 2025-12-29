import React from "react";
import { VisualizerProps } from "../../models/types";

export const LinesVisualizer: React.FC<VisualizerProps> = ({ visualization }) => {
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
};

