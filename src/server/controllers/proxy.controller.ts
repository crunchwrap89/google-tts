import { Request, Response } from "express";
import { Readable } from "stream";

export const proxyHandler = async (req: Request, res: Response) => {
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
};

