import express, { Router } from "express";
import { createChatRoutes } from "./routes/chats";
import { Db } from "mongodb";
import { createEditorRoutes } from "./routes/editor";
import { createGraphRoutes } from "./routes/graphs";

export async function createServer(db: Db) {
  const server = express();
  const router = Router();
  server.use(router);

  server.use("/api/chats", await createChatRoutes(db));
  server.use("/api/editor", await createEditorRoutes());
  server.use("/api/graphs", await createGraphRoutes());

  router.get("/health", (req, res) => {
    res.json({
      ok: true,
    });
  });

  return server;
}
