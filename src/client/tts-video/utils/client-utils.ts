import { TTSConst } from "../../../server/tts/const/TTSConst";
import { RequestMetadata, ServerResponse, Timepoint } from "../../../common/types";

export const getTTSFromServer = async (
  props: RequestMetadata,
): Promise<{ url: string; timepoints: Timepoint[] }> => {
  const result: ServerResponse = await (
    await fetch(TTSConst.SERVER_URL + `/getdata`, {
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

export const waitForNoInput = (signal: AbortSignal, ms: number) => {
  if (signal.aborted) {
    return Promise.reject(new Error("stale"));
  }

  return Promise.race<void>([
    new Promise<void>((_, reject) => {
      signal.addEventListener("abort", () => {
        reject(new Error("stale"));
      });
    }),
    new Promise<void>((resolve) => {
      setTimeout(() => {
        resolve();
      }, ms);
    }),
  ]);
};
