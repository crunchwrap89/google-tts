import express from "express";
import { createTextToSpeechAudio } from "./TextToSpeech";
import cors from "cors";
import dotenv from "dotenv";
import { RequestMetadata, ServerResponse } from "../lib/interfaces";
import { Readable } from "stream";

dotenv.config();

export const startServer = () => {
  const app = express();
  const port = process.env.SERVER_PORT || 5050;

  app.use(express.json());
  app.use(cors({ origin: "*" }));

  app.get("/proxy", async (req, res) => {
    const { url } = req.query;
    if (typeof url !== "string") {
      return res.status(400).send("Missing url");
    }
    try {
      const headers: HeadersInit = {};
      if (req.headers.range) {
        headers["Range"] = req.headers.range as string;
      }

      const response = await fetch(url, { method: req.method, headers });

      if (!response.ok && response.status !== 206) {
        return res.status(response.status).send(response.statusText);
      }

      res.status(response.status);

      const headersToForward = [
        "content-type",
        "content-length",
        "accept-ranges",
        "content-range",
      ];
      headersToForward.forEach((header) => {
        const value = response.headers.get(header);
        if (value) {
          res.setHeader(
            header
              .split("-")
              .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
              .join("-"),
            value,
          );
        }
      });

      res.setHeader("Access-Control-Allow-Origin", "*");
      res.setHeader(
        "Access-Control-Expose-Headers",
        "Content-Length, Content-Range, Accept-Ranges",
      );

      if (response.body) {
        // @ts-expect-error: Readable.fromWeb expects a specific stream type
        Readable.fromWeb(response.body).pipe(res);
      } else {
        res.end();
      }
    } catch (err) {
      console.error(err);
      res.status(500).send((err as Error).message);
    }
  });

  app.post(`/getdata`, async (req, res) => {
    try {
      const data = req.body as RequestMetadata;

      const { url, timepoints } = await createTextToSpeechAudio({ ...data });

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
  });

  return app.listen(port, () => {
    console.log(`TTS server listening on ${port}`);
  });
};
