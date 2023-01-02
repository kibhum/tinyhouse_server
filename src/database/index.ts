import { MongoClient, ServerApiVersion } from "mongodb";
import { Database, Listing, Booking, User } from "../lib/types";

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_USER_PASSWORD}@${process.env.DB_CLUSTER}.mongodb.net/?retryWrites=true&w=majority`;

const localMongoDBUri = `${process.env.MONGODB_URL}`;
export const connectDatabase = async (): Promise<Database> => {
  const client = await MongoClient.connect(localMongoDBUri, {
    serverApi: ServerApiVersion.v1,
  });

  const db = client.db("main");
  await client.connect();
  console.log("Connected successfully to MongoDB");

  return {
    bookings: db.collection<Booking>("bookings"),
    listings: db.collection<Listing>("listings"),
    users: db.collection<User>("users"),
  };
};
