import { Request, Response } from "express";
import { RequestMetadata, ServerResponse } from "../../common/types";
import { ServerUtil } from "../ServerUtil";

export const getDataHandler = async (req: Request, res: Response) => {
  try {
    const data = req.body as RequestMetadata;

    const { url, timepoints } = await ServerUtil.createTextToSpeechAudio({ ...data });

    return res
      .json({ type: "success", url, timepoints } as ServerResponse)
      .end();
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({
        type: "error",
        error: (err as Error).message,
      } as ServerResponse)
      .end();
  }
};

