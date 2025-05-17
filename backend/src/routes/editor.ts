import { Router } from "express";
import { Db } from "mongodb";

export async function createEditorRoutes(db: Db): Promise<Router> {
  const router = Router();
  const collection = db.collection("editor");

  return router;
}
