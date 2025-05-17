import express, { Router } from "express";
import { connectToDB } from "./db/connection";
import { createServer } from "./server";

//
//    * Chats
//      - C R U D a chat
//
//    * Graphs
//      - Create Initial Graph
//      - Compile Graph (POST graph body with globals)
//      - Delete graph
//
//    * Files (TBD)
//

async function main() {
  const mongo = await connectToDB();
  if (!mongo) {
    return;
  }
  await mongo.db.command({ ping: 1 });

  const server = await createServer(mongo.db);
  server.listen(3000, () => {
    console.log(`Server starting on port 3000`);
  });
}
main();
