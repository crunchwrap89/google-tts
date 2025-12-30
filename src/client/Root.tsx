import { Composition, staticFile } from "remotion";
import { Input, UrlSource, ALL_FORMATS } from "mediabunny";
import { waitForNoInput } from "./tts-video/utils/client-utils";
import { FC } from "react";
import { TTSVideo } from "./tts-video/components/TTSVideo";
import { mySchema } from "../common/schema";
import { getTTSFromServer } from "./tts-video/utils/client-utils";
import { SERVER_URL } from "../common/const";
import { parseMarkdown } from "./utils/markdown-parser";
import { generateSsmlFromSegments } from "./utils/ssml-utils";

export const RemotionRoot: FC = () => {
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
        animationStyle: "typewriter" as const,
        visualizationStyle: "bars" as const,
      }}
      calculateMetadata={async ({ props, abortSignal, isRendering }) => {
        // don't debounce user input during rendering
        if (!isRendering) {
          await waitForNoInput(abortSignal, 1000);
        }

        // Fetch and parse markdown
        const response = await fetch(staticFile('texts/example.md'));
        if (!response.ok) {
            throw new Error(`Failed to fetch markdown: ${response.status} ${response.statusText}`);
        }
        const markdown = await response.text();
        if (markdown.trim().startsWith('<!DOCTYPE html>')) {
             throw new Error('Fetched content is HTML, not Markdown. Check file path.');
        }
        console.log("Fetched markdown length:", markdown.length);

        const { segments } = await parseMarkdown(markdown);
        console.log("Parsed segments:", segments.length);
        console.log(segments)

        const { ssml, codeBlocks: codeBlocksData, captionText } = generateSsmlFromSegments(segments);
        console.log("Generated SSML length:", ssml.length);
        console.log("Caption text length:", captionText.length);

        const { url: audioUrl, timepoints } = await getTTSFromServer({ ...props, ssml, captionText });

        const finalCodeBlocks = codeBlocksData.map((block, index) => {
            const startMark = timepoints.find(tp => tp.markName === `code_${index}_start`);
            return {
                ...block,
                startTime: startMark ? startMark.timeSeconds : 0
            };
        });

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
            codeBlocks: finalCodeBlocks,
            captionText,
          },
          durationInFrames: 35 + audioDurationInFrames + 35,
        };
      }}
    />
  );
};
