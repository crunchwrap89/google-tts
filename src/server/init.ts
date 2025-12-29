import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { proxyHandler } from "./controllers/proxy.controller";
import { getDataHandler } from "./controllers/tts.controller";

dotenv.config();

export const startServer = () => {
  const app = express();
  const port = process.env.SERVER_PORT || 5050;

  app.use(express.json());
  app.use(cors({ origin: "*" }));

  app.get("/proxy", proxyHandler);

  app.post(`/getdata`, getDataHandler);

  return app.listen(port, () => {
    console.log(`TTS server listening on ${port}`);
  });
};


