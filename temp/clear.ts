import dotenv from "dotenv";
dotenv.config({ path: "./config.env" });
import { ObjectId } from "mongodb";

import { Listing, ListingType, User } from "../src/lib/types";
import { connectDatabase } from "../src/database";

const clear = async () => {
  try {
    console.log("[clear]: Running...");
    const db = await connectDatabase();
    const listings = await db.listings.find({}).toArray();
    const users = await db.users.find({}).toArray();
    const bookings = await db.bookings.find({}).toArray();

    if (listings.length > 0) {
      await db.listings.drop();
    }
    if (bookings.length > 0) {
      await db.bookings.drop();
    }
    if (users.length > 0) {
      await db.users.drop();
    }

    console.log("[clear]: successfully!");
    process.exit();
  } catch (error) {
    console.log("Failed to clear database!");
    console.error(error);
    process.exit();
  }
};

clear();
