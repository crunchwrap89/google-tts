import { SERVER_URL } from "../server/TextToSpeech/constants";
import { RequestMetadata, ServerResponse, Timepoint } from "./interfaces";

export const getTTSFromServer = async (
  props: RequestMetadata,
): Promise<{ url: string; timepoints: Timepoint[] }> => {
  const result: ServerResponse = await (
    await fetch(SERVER_URL + `/getdata`, {
      method: "POST",
      body: JSON.stringify(props),
      headers: { "Content-Type": "application/json" },
    })
  ).json();
  if (result.type === "error") {
    console.error("TTS Server Error:", result.error);
    throw new Error(result.error);
  }
  return { url: result.url, timepoints: result.timepoints };
};
