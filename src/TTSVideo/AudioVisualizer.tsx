import React from "react";
import { useAudioVisualization } from "./hooks/useAudioVisualization";
import { BarsVisualizer } from "./components/visualizers/BarsVisualizer";
import { WaveVisualizer } from "./components/visualizers/WaveVisualizer";
import { ClassicVisualizer } from "./components/visualizers/ClassicVisualizer";
import { LinesVisualizer } from "./components/visualizers/LinesVisualizer";

export type VisualizationStyle = "bars" | "wave" | "classic" | "lines";

export const AudioVisualizer: React.FC<{
  audioUrl: string;
  visualizationStyle?: VisualizationStyle;
}> = ({ audioUrl, visualizationStyle = "bars" }) => {
  const { visualization, audioData } = useAudioVisualization(audioUrl, 32);

  if (!audioData) {
    return null;
  }

  const renderVisualization = () => {
    switch (visualizationStyle) {
      case "wave":
        return <WaveVisualizer visualization={visualization} />;
      case "classic":
        return <ClassicVisualizer visualization={visualization} />;
      case "lines":
        return <LinesVisualizer visualization={visualization} />;
      case "bars":
      default:
        return <BarsVisualizer visualization={visualization} />;
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
