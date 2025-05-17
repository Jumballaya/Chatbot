import express, { Router } from "express";

export function createServer() {
  const server = express();
  const router = Router();
  server.use(router);

  router.get("/", (req, res) => {
    res.json({
      hello: "world",
    });
  });

  return server;
}
