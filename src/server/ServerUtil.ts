import md5 from "md5";
import {
  checkIfAudioHasAlreadyBeenSynthesized as isAudioAlreadySynthesized,
  createFirebaseUrl,
  downloadJsonFromFirebase,
  uploadFileToFirebase,
  uploadJsonToFirebase,
} from "../client/firebase/utils";
import textToSpeech from "@google-cloud/text-to-speech";
import { RequestMetadata, Timepoint } from "../common/types";
import { AUDIO_DIRECTORY_IN_BUCKET, VOICES } from "../common/const";
import { splitSsml } from "./utils/ssml-splitter";

const client = new textToSpeech.v1beta1.TextToSpeechClient();

const createTextToSpeechAudio = async (
  props: RequestMetadata,
): Promise<{ url: string; timepoints: Timepoint[] }> => {
  if (!VOICES[props.voice]) throw new Error("Voice not found");
  const selectedVoice = VOICES[props.voice];

  let ssml: string;
  if (props.ssml) {
    ssml = props.ssml;
  } else {
    const words = props.captionText.trim().split(/\s+/);
    const markedText = words
      .map((word, i) => `<mark name="word_${i}"/>${word}`)
      .join(" ");

    ssml = `
<speak>
<prosody>
${markedText}
</prosody>
</speak>`;
  }

  /**
   * * Determine directory name from SSML, directory in bucket, and voice name, to make a really unique fileName.
   * * Only hashing the SSML makes it easy to find specific voice audios in Firebase storage.
   */
  const ssmlHash = md5(`${ssml} ${props.speakingRate} ${props.pitch}`);
  const filePathInBucket = `${AUDIO_DIRECTORY_IN_BUCKET}/${selectedVoice.name}-${ssmlHash}.wav`;
  const timepointsPathInBucket = filePathInBucket.replace(".wav", ".json");

  // Return URL if already exists
  const fileExists = await isAudioAlreadySynthesized(filePathInBucket);
  if (fileExists) {
    const timepoints = await downloadJsonFromFirebase(timepointsPathInBucket);
    if (timepoints && Array.isArray(timepoints) && timepoints.length > 0) {
      return { url: fileExists, timepoints: timepoints as Timepoint[] };
    }
    console.log("Cached audio exists but timepoints are missing or empty. Re-synthesizing...");
  }

  // Split SSML if too long
  const ssmlChunks = splitSsml(ssml, 4500);
  console.log(`Split SSML into ${ssmlChunks.length} chunks.`);
  ssmlChunks.forEach((c, i) => console.log(`Chunk ${i} length: ${c.length}`));

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let combinedRawAudio: any = Buffer.alloc(0);
  const combinedTimepoints: Timepoint[] = [];
  let timeOffset = 0;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let wavHeader: any = null;
  let sampleRate = 24000; // default fallback
  let channels = 1;
  let bytesPerSample = 2;

  for (let i = 0; i < ssmlChunks.length; i++) {
    const chunkSsml = ssmlChunks[i];

    // Create the TTS audio
    // https://cloud.google.com/text-to-speech/docs/reference/rest/v1/text/synthesize

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const request: any = {
      input: {
        ssml: chunkSsml,
      },
      voice: {
        name: selectedVoice.name,
        languageCode: selectedVoice.languageCode,
      },
      audioConfig: {
        audioEncoding: "LINEAR16", // Higher quality than 'MP3'
        effectsProfileId: ["large-home-entertainment-class-device"], // Sounds better than small-devices
        speakingRate: props.speakingRate,
        pitch: props.pitch,
      },
      enableTimePointing: ["SSML_MARK"],
    };

    console.log(`Sending request to Google TTS (Chunk ${i + 1}/${ssmlChunks.length})`);
    console.log("Request:", JSON.stringify(request, null, 2));

    try {
        const [response] = await client.synthesizeSpeech(request);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const responseAny = response as any;

        const extractedTimepoints = responseAny.timepoints || responseAny.timePoints || responseAny.time_points;
        const audioContent = response.audioContent;

        if (!audioContent) {
            console.error(`Chunk ${i} returned no audio content`);
            continue;
        }

        const audioBuffer = Buffer.from(audioContent as unknown as Uint8Array);
        console.log(`Chunk ${i} audio length: ${audioBuffer.length} bytes`);

        if (i === 0) {
            // Capture header from first chunk
            if (audioBuffer.length > 44) {
                wavHeader = Buffer.alloc(44);
                audioBuffer.copy(wavHeader, 0, 0, 44);

                channels = wavHeader.readUInt16LE(22);
                sampleRate = wavHeader.readUInt32LE(24);
                const bitsPerSample = wavHeader.readUInt16LE(34);
                bytesPerSample = bitsPerSample / 8;

                console.log(`Detected WAV format: ${sampleRate}Hz, ${channels} channels, ${bitsPerSample} bits`);
            }
        }

        // Strip 44-byte WAV header
        const rawAudio = audioBuffer.length > 44 ? audioBuffer.slice(44) : audioBuffer;

        // Append raw audio
        combinedRawAudio = Buffer.concat([combinedRawAudio, rawAudio]);

        // Append timepoints with offset
        if (extractedTimepoints) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const adjustedTimepoints = extractedTimepoints.map((tp: any) => ({
            ...tp,
            timeSeconds: tp.timeSeconds + timeOffset
          }));
          combinedTimepoints.push(...adjustedTimepoints);
        }

        // Calculate duration of this chunk to update offset
        const chunkDuration = rawAudio.length / (sampleRate * channels * bytesPerSample);
        timeOffset += chunkDuration;
        console.log(`Chunk ${i} duration: ${chunkDuration}s, new offset: ${timeOffset}s`);

    } catch (e) {
        console.error(`Error processing chunk ${i}:`, e);
        throw e;
    }
  }

  // Reconstruct WAV file
  let finalAudio: Buffer;
  if (wavHeader) {
      // Update sizes in header
      const dataSize = combinedRawAudio.length;
      const fileSize = dataSize + 36;

      wavHeader.writeUInt32LE(fileSize, 4);
      wavHeader.writeUInt32LE(dataSize, 40);

      finalAudio = Buffer.concat([wavHeader, combinedRawAudio]);
  } else {
      finalAudio = combinedRawAudio;
  }

  console.log(`Total audio length: ${finalAudio.length} bytes`);
  console.log(`Total estimated duration: ${timeOffset}s`);

  if (combinedTimepoints.length === 0) {
    console.warn("Google TTS returned no timepoints. Ensure enableTimePointing is working.");
  } else {
    console.log(`Received ${combinedTimepoints.length} timepoints from Google TTS.`);
  }

  // Upload the file to firebase
  const uploadedFile = await uploadFileToFirebase(
    finalAudio as unknown as Uint8Array,
    filePathInBucket,
  );

  const timepoints = combinedTimepoints || [];
  await uploadJsonToFirebase(timepoints, timepointsPathInBucket);

  const { fullPath } = uploadedFile.metadata;

  return {
    url: await createFirebaseUrl(fullPath),
    timepoints: timepoints as Timepoint[],
  };
};

export const ServerUtil = {
  createTextToSpeechAudio,
}