import {
  AbsoluteFill,
  Html5Audio,
  interpolate,
  Sequence,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { Captions } from "./TTSVideo/Captions";
import { voices } from "./server/TextToSpeech/constants";
import { RequestMetadata, VoiceType } from "./lib/interfaces";
import { z } from "zod";
import { zColor } from "@remotion/zod-types";
import { SERVER_URL } from "./server/TextToSpeech/constants";
import { AudioVisualizer } from "./TTSVideo/AudioVisualizer";
import { SyncStatus } from "./TTSVideo/SyncStatus";

export const mySchema = z.object({
  captionText: z.string(),
  captionColor: zColor(),
  voice: z.enum(
    Object.keys(voices) as [VoiceType] | [VoiceType, ...VoiceType[]],
  ),
  pitch: z.coerce.number().min(-20).max(20),
  speakingRate: z.coerce.number().min(0.25).max(4),
  audioUrl: z.string().or(z.null()),
  timepoints: z
    .array(
      z.object({
        markName: z.string(),
        timeSeconds: z.number(),
      }),
    )
    .optional(),
  debug: z.boolean().optional(),
  animationStyle: z
    .enum(["pop", "karaoke", "typewriter", "matrix"])
    .optional(),
  visualizationStyle: z
    .enum(["bars", "wave", "classic", "lines"])
    .optional(),
});

export const TTSVideo: React.FC<RequestMetadata> = (props) => {
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

          <Captions {...props} />
        </Sequence>
      </div>
    </AbsoluteFill>
  );
};
