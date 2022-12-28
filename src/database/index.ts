import { MongoClient, ServerApiVersion } from "mongodb";
import { Database } from "../lib/types";

const user = `tinyhousev1`;
const userPassword = `3Mf3qlkiZSFOXnUb`;
const cluster = `tinyhousev1.qvfnojs`;

const uri = `mongodb+srv://${user}:${userPassword}@${cluster}.mongodb.net/?retryWrites=true&w=majority`;

export const connectDatabase = async (): Promise<Database> => {
  const client = await MongoClient.connect(uri, {
    serverApi: ServerApiVersion.v1,
  });

  //   const client = new MongoClient(uri, {
  //     serverApi: ServerApiVersion.v1,
  //   });
  const db = client.db("main");
  await client.connect();
  console.log("Connected successfully to MongoDB");
  return {
    listings: db.collection("test_listings"),
  };
};
