import {
  Html5Audio,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { SERVER_URL } from "../server/TextToSpeech/constants";
import { RequestMetadata } from "../lib/interfaces";
import { AudioVisualizer } from "./AudioVisualizer";

export const Text: React.FC<RequestMetadata> = (props) => {
  const { titleText, titleColor, subtitleText, timepoints } = props;
  const videoConfig = useVideoConfig();
  const realFrame = useCurrentFrame();

  const audioDurationFrames = Math.max(1, videoConfig.durationInFrames - 35);
  const titleTextForAnimation = titleText.trim().split(/\s+/).map((t) => ` ${t} `);
  const delayPerWord = audioDurationFrames / titleTextForAnimation.length;

  const proxiedUrl = props.audioUrl
    ? `${SERVER_URL}/proxy?url=${encodeURIComponent(props.audioUrl)}`
    : null;

  if (!timepoints || timepoints.length === 0) {
    console.warn("No timepoints available for text animation sync.");
  }

  return (
    <>
      {/* Debug indicator for sync status */}
      <div
        style={{
          position: "absolute",
          top: 50,
          left: 50,
          fontSize: 24,
          fontWeight: "bold",
          color: timepoints && timepoints.length > 0 ? "green" : "red",
          zIndex: 1000,
        }}
      >
        Sync:{" "}
        {timepoints && timepoints.length > 0
          ? "Active"
          : "Fallback (Linear) - Try restarting server"}
      </div>

      {proxiedUrl && (
        <Html5Audio id="TTS Audio" about="TTS Audio" src={proxiedUrl} />
      )}

      {proxiedUrl && <AudioVisualizer audioUrl={props.audioUrl!} />}

      <h1
        style={{
          fontFamily: "SF Pro Text, Helvetica, Arial",
          fontWeight: "bold",
          fontSize: 110,
          textAlign: "center",
          position: "absolute",
          top: 160,
          width: "100%",
        }}
      >
        {titleTextForAnimation.map((t, i) => {
          const timepoint = timepoints?.find(
            (tp) => tp.markName === `word_${i}`,
          );
          const startFrame = timepoint
            ? Number(timepoint.timeSeconds) * videoConfig.fps
            : i * delayPerWord;

          return (
            <span
              key={`${i}-${t}`}
              style={{
                color: titleColor,
                marginLeft: 10,
                marginRight: 10,
                transform: `scale(${spring({
                  fps: videoConfig.fps,
                  frame: realFrame - startFrame,
                  config: {
                    damping: 100,
                    stiffness: 200,
                    mass: 0.5,
                  },
                })})`,
                display: "inline-block",
              }}
            >
              {t}
            </span>
          );
        })}
      </h1>

      <h2
        style={{
          opacity: interpolate(
            realFrame,
            [audioDurationFrames, audioDurationFrames + 5],
            [0.1, 1],
          ),
          transform: `scale(${interpolate(
            realFrame,
            [audioDurationFrames, audioDurationFrames + 5],
            [0.9, 1],
            {
              extrapolateRight: "clamp",
            },
          )})`,
          fontFamily: "SF Pro Text, Helvetica, Arial",
          fontWeight: "bold",
          fontSize: 70,
          textAlign: "center",
          position: "absolute",
          bottom: 160,
          width: "100%",
          color: titleColor,
        }}
      >
        {subtitleText}
      </h2>
    </>
  );
};
