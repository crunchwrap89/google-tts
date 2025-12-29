import React from "react";
import { useAudioVisualization } from "../hooks/useAudioVisualization";
import { BarsVisualizer } from "./BarsVisualizer";
import { WaveVisualizer } from "./WaveVisualizer";
import { ClassicVisualizer } from "./ClassicVisualizer";
import { LinesVisualizer } from "./LinesVisualizer";
import { VisualizationStyle } from "../../../../common/types";
import { DEFAULT_NUMBER_OF_SAMPLES } from "../../../../common/const";

export const AudioVisualizer: React.FC<{
  audioUrl: string;
  visualizationStyle?: VisualizationStyle;
  numberOfSamples?: number;
}> = ({ audioUrl, visualizationStyle = "bars", numberOfSamples = DEFAULT_NUMBER_OF_SAMPLES }) => {
  const { visualization, audioData } = useAudioVisualization(audioUrl, numberOfSamples);

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
