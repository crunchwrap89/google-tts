import md5 from "md5";
import {
  checkIfAudioHasAlreadyBeenSynthesized as isAudioAlreadySynthesized,
  createFirebaseUrl,
  downloadJsonFromFirebase,
  uploadFileToFirebase,
  uploadJsonToFirebase,
} from "../../lib/firebase/utils";
import { audioDirectoryInBucket, voices } from "./constants";
import textToSpeech from "@google-cloud/text-to-speech";
import { RequestMetadata, Timepoint } from "../../lib/interfaces";

const client = new textToSpeech.v1beta1.TextToSpeechClient();

export const createTextToSpeechAudio = async (
  props: RequestMetadata,
): Promise<{ url: string; timepoints: Timepoint[] }> => {
  if (!voices[props.voice]) throw new Error("Voice not found");
  const selectedVoice = voices[props.voice];

  const words = props.captionText.trim().split(/\s+/);
  const markedText = words
    .map((word, i) => `<mark name="word_${i}"/>${word}`)
    .join(" ");

  const ssml = `
<speak>
<prosody>
${markedText}
</prosody>
</speak>`;

  /**
   * * Determine directory name from SSML, directory in bucket, and voice name, to make a really unique fileName.
   * * Only hashing the SSML makes it easy to find specific voice audios in Firebase storage.
   */
  const ssmlHash = md5(`${ssml} ${props.speakingRate} ${props.pitch}`);
  const filePathInBucket = `${audioDirectoryInBucket}/${selectedVoice.name}-${ssmlHash}.mp3`;
  const timepointsPathInBucket = filePathInBucket.replace(".mp3", ".json");

  // Return URL if already exists
  const fileExists = await isAudioAlreadySynthesized(filePathInBucket);
  if (fileExists) {
    const timepoints = await downloadJsonFromFirebase(timepointsPathInBucket);
    if (timepoints && Array.isArray(timepoints) && timepoints.length > 0) {
      return { url: fileExists, timepoints: timepoints as Timepoint[] };
    }
    console.log("Cached audio exists but timepoints are missing or empty. Re-synthesizing...");
  }

  // Create the TTS audio
  // https://cloud.google.com/text-to-speech/docs/reference/rest/v1/text/synthesize
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const request: any = {
    input: {
      ssml,
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

  console.log("Sending request to Google TTS:", JSON.stringify(request, null, 2));
  const [response] = await client.synthesizeSpeech(request);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const responseAny = response as any;
  console.log("Google TTS Response Keys:", Object.keys(responseAny));

  const extractedTimepoints = responseAny.timepoints || responseAny.timePoints || responseAny.time_points;

  if (!extractedTimepoints || extractedTimepoints.length === 0) {
    console.warn("Google TTS returned no timepoints. Ensure enableTimePointing is working.");
  } else {
    console.log(`Received ${extractedTimepoints.length} timepoints from Google TTS.`);
    console.log("First timepoint:", JSON.stringify(extractedTimepoints[0]));
  }

  // Upload the file to firebase
  const uploadedFile = await uploadFileToFirebase(
    response.audioContent as Uint8Array,
    filePathInBucket,
  );

  const timepoints = extractedTimepoints || [];
  await uploadJsonToFirebase(timepoints, timepointsPathInBucket);

  const { fullPath } = uploadedFile.metadata;

  return {
    url: await createFirebaseUrl(fullPath),
    timepoints: timepoints as Timepoint[],
  };
};
