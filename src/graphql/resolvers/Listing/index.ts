import { ObjectId } from "mongodb";
import { Request } from "express";
import { IResolvers } from "@graphql-tools/utils";
import { Database, Listing, User } from "../../../lib/types";
import { ListingArgs, ListingBookingsData, ListingBookingsArgs } from "./types";
import { authorize } from "../../../lib/utils";

export const listingResolvers: IResolvers = {
  Query: {
    listing: async (
      _root: undefined,
      { id }: ListingArgs,
      { db, req }: { db: Database; req: Request }
    ): Promise<Listing> => {
      try {
        const listing = await db.listings.findOne({ _id: new ObjectId(id) });
        if (!listing) {
          throw new Error("Listing can't be found");
        }
        const viewer = await authorize(db, req);
        if (viewer && viewer._id === listing.host) {
          listing.authorized = true;
        }
        return listing;
      } catch (error) {
        console.error(error);
        throw new Error(`There was a problem querying the listing!: ${error}`);
      }
    },
  },
  Listing: {
    id: (listing: Listing): string => {
      return listing._id.toString();
    },
    host: async (
      listing: Listing,
      _args: object,
      { db }: { db: Database }
    ): Promise<User> => {
      const host = await db.users.findOne({ _id: listing.host });
      if (!host) {
        throw new Error("Host can't be found");
      }
      return host;
    },
    bookingsIndex: (listing: Listing): string => {
      return JSON.stringify(listing.bookingsIndex);
    },
    bookings: async (
      listing: Listing,
      { limit, page }: ListingBookingsArgs,
      { db }: { db: Database }
    ): Promise<ListingBookingsData | null> => {
      try {
        if (!listing.authorized) {
          return null;
        }
        const data: ListingBookingsData = {
          total: 0,
          result: [],
        };
        let cursor = db.bookings.find({
          _id: { $in: listing.bookings },
        });
        data.total = await cursor.count();
        cursor = cursor.skip(page > 0 ? page - 1 * limit : 0);
        cursor = cursor.limit(limit);
        data.result = await cursor.toArray();
        return data;
      } catch (error) {
        throw new Error(`Failed to find listing bookings: ${error}`);
      }
    },
  },
};
