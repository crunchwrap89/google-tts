import {
  AbsoluteFill,
  Html5Audio,
  interpolate,
  Sequence,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { RequestMetadata } from "../../../common/types";
import { Captions } from "../tts-captions/components/Captions";
import { AudioVisualizer } from "../tts-visualizers/components/AudioVisualizer";
import { SyncStatus } from "../tts-debug/components/SyncStatus";
import { CodeBlockRenderer } from "./CodeBlockRenderer";
import { FC } from "react";
import { SERVER_URL } from "../../../common/const";

export const TTSVideo: FC<RequestMetadata> = (props) => {
  const frame = useCurrentFrame();
  const videoConfig = useVideoConfig();

  const opacity = interpolate(
    frame,
    [videoConfig.durationInFrames - 25, videoConfig.durationInFrames - 15],
    [1, 0],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    },
  );
  const transitionStart = 25;

  const proxiedUrl = props.audioUrl
    ? `${SERVER_URL}/proxy?url=${encodeURIComponent(props.audioUrl)}`
    : null;

  return (
    <AbsoluteFill style={{ flex: 1, backgroundColor: "white" }}>
      <div style={{ opacity }}>
        <Sequence from={transitionStart + 10}>
          {props.debug && (
            <SyncStatus
              isSynced={!!(props.timepoints && props.timepoints.length > 0)}
            />
          )}

          {proxiedUrl && (
            <Html5Audio id="TTS Audio" about="TTS Audio" src={proxiedUrl} />
          )}

          {proxiedUrl && (
            <AudioVisualizer
              audioUrl={props.audioUrl!}
              visualizationStyle={props.visualizationStyle}
            />
          )}

          <CodeBlockRenderer codeBlocks={props.codeBlocks} />

          <Captions {...props} />
        </Sequence>
      </div>
    </AbsoluteFill>
  );
};
