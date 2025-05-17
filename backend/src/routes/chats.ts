import { Router } from "express";
import { Db } from "mongodb";
import { Chat } from "../chats/types";

export async function createChatRoutes(db: Db): Promise<Router> {
  const router = Router();
  const collection = db.collection<Chat>("chats");

  router.post("/", async (res, req) => {
    req.json({
      endpoint: "create a new chat",
    });
  });

  router.get("/:id", (res, req) => {
    req.json({
      id: res.params.id,
      endpoint: "get a chat by id",
    });
  });

  router.patch("/:id", (res, req) => {
    req.json({
      id: res.params.id,
      endpoint: "update a chat by id",
    });
  });

  router.delete("/:id", (res, req) => {
    req.json({
      id: res.params.id,
      endpoint: "delete a chat by id",
    });
  });

  return router;
}
