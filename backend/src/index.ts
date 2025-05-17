import express, { Router } from "express";

//
//    * Chats
//
//
//    * Graphs
//
//
//    * Files (TBD)
//

const server = express();
const router = Router();
server.use(router);

router.get("/", (req, res) => {
  res.json({
    hello: "world",
  });
});

server.listen(3000, () => {
  console.log(`Server starting on port 3000`);
});
