import { Composition } from "remotion";
import { Input, UrlSource, ALL_FORMATS } from "mediabunny";
import { TTSVideo, mySchema } from "./TTSVideo";
import { getTTSFromServer } from "./lib/client-utils";
import { waitForNoInput } from "./debounce";
import { SERVER_URL } from "./server/TextToSpeech/constants";

export const RemotionRoot: React.FC = () => {
  const FPS = 30;
  if (!process.env.GOOGLE_APPLICATION_CREDENTIALS)
    throw new Error(
      "GOOGLE_APPLICATION_CREDENTIALS environment variable is missing. Read the instructions in README.md file and complete the setup.",
    );

  if (!process.env.FIREBASE_API_KEY)
    throw new Error(
      "FIREBASE_API_KEY environment variable is missing. Read the instructions in README.md file and complete the setup.",
    );
  if (!process.env.FIREBASE_AUTH_DOMAIN)
    throw new Error(
      "FIREBASE_AUTH_DOMAIN environment variable is missing. Read the instructions in README.md file and complete the setup.",
    );

  if (!process.env.FIREBASE_PROJECT_ID)
    throw new Error(
      "FIREBASE_PROJECT_ID environment variable is missing. Read the instructions in README.md file and complete the setup.",
    );
  if (!process.env.FIREBASE_STORAGE_BUCKET)
    throw new Error(
      "FIREBASE_STORAGE_BUCKET environment variable is missing. Read the instructions in README.md file and complete the setup.",
    );

  if (!process.env.FIREBASE_MESSAGING_SENDER_ID)
    throw new Error(
      "FIREBASE_MESSAGING_SENDER_ID environment variable is missing. Read the instructions in README.md file and complete the setup.",
    );

  if (!process.env.FIREBASE_APP_ID)
    throw new Error(
      "FIREBASE_APP_ID environment variable is missing. Read the instructions in README.md file and complete the setup.",
    );

  return (
    <Composition
      id="TTSVideo"
      schema={mySchema}
      component={TTSVideo}
      durationInFrames={300}
      fps={FPS}
      width={1920}
      height={1080}
      defaultProps={{
        captionText:
          "Hi there, my name is Gemma. I will guide you through your course. But first, let me introduce myself. I am not a person, i am just plain text that has been dynamically generated into an audio file. Then i have been streamed serverside and my creator made me more fun to listen to by adding a visualizer. He also synced the captions with the pace of my voice. What do you think?" as const,
        captionColor: "#2E8AEA" as const,
        voice: "Woman 1 (US)" as const,
        pitch: 0,
        speakingRate: 1,
        audioUrl: null,
        animationStyle: "pop" as const,
      }}
      calculateMetadata={async ({ props, abortSignal, isRendering }) => {
        // don't debounce user input during rendering
        if (!isRendering) {
          await waitForNoInput(abortSignal, 1000);
        }

        const { url: audioUrl, timepoints } = await getTTSFromServer({ ...props });

        const proxiedUrl = `${SERVER_URL}/proxy?url=${encodeURIComponent(audioUrl)}`;
        const source = new UrlSource(proxiedUrl);
        const input = new Input({ source, formats: ALL_FORMATS });
        const audioDurationInSeconds = await input.computeDuration();
        input.dispose();

        const audioDurationInFrames = Math.ceil(audioDurationInSeconds * FPS);
        return {
          props: {
            ...props,
            audioUrl,
            timepoints,
          },
          durationInFrames: 35 + audioDurationInFrames + 35,
        };
      }}
    />
  );
};
