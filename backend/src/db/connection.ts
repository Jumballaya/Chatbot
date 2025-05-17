import { MongoClient } from "mongodb";

const dbURI =
  "mongodb://admin:password@mongodb:27017/llmgraph?authSource=admin";

export async function connectToDB() {
  const client = new MongoClient(dbURI);
  try {
    await client.connect();
    await client.db("llmgraph").command({ ping: 1 });

    return {
      db: client.db("llmgraph"),
      close: () => client.close(),
    };
  } catch (e) {
    console.error(e);
    await client.close();
  }
}
