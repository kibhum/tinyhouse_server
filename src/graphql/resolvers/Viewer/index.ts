import crypto from "crypto";
import { Request, Response } from "express";
import { IResolvers } from "@graphql-tools/utils";
import { Viewer, Database, User } from "../../../lib/types";
import { Google } from "../../../lib/api";
import { LoginArgs } from "./types";

const cookieOptions = {
  httpOnly: true,
  sameSite: true,
  signed: true,
  secure: process.env.NODE_ENV!.trim() == "development" ? false : true,
};

const loginViaGoogle = async (
  code: string,
  token: string,
  db: Database,
  res: Response
): Promise<User | undefined | null> => {
  const { user } = await Google.logIn(code);
  if (!user) {
    throw new Error(`Google login error`);
  }
  // Names, Photos, Emails Lists
  const userNamesLists = user.names && user.names.length ? user.names : null;
  const userPhotosLists =
    user.photos && user.photos.length ? user.photos : null;
  const userEmailsLists =
    user.emailAddresses && user.emailAddresses.length
      ? user.emailAddresses
      : null;
  // Display name
  const userName = userNamesLists ? userNamesLists[0].displayName : null;
  // User ID
  const userId =
    userNamesLists &&
    userNamesLists[0].metadata &&
    userNamesLists[0].metadata.source
      ? userNamesLists[0].metadata.source.id
      : null;
  // User Avatar
  const userAvatar =
    userPhotosLists && userPhotosLists ? userPhotosLists[0].url : null;
  // User Email
  const userEmail =
    userEmailsLists && userEmailsLists ? userEmailsLists[0].value : null;

  if (!userId || !userName || !userEmail || !userAvatar) {
    throw new Error(`Google login error`);
  }
  const updateRes = await db.users.findOneAndUpdate(
    { _id: userId },
    { $set: { name: userName, avatar: userAvatar, contact: userEmail, token } },
    { returnDocument: "after" }
  );
  let viewer = updateRes.value;
  if (!viewer) {
    const insertedResult = await db.users.insertOne({
      _id: userId,
      name: userName,
      avatar: userAvatar,
      contact: userEmail,
      token,
      income: 0,
      bookings: [],
      listings: [],
    });
    viewer = await db.users.findOne({ _id: insertedResult.insertedId });
  }
  res.cookie("viewer", userId, {
    ...cookieOptions,
    maxAge: 365 * 24 * 60 * 60 * 1000,
  });
  return viewer;
};

const loginViaCookie = async (
  token: string,
  db: Database,
  req: Request,
  res: Response
): Promise<User | undefined | null> => {
  const updateRes = await db.users.findOneAndUpdate(
    {
      _id: req.signedCookies.viewer,
    },
    { $set: { token } },
    { returnDocument: "after" }
  );
  const viewer = updateRes.value;
  if (!viewer) {
    res.clearCookie("viewer", cookieOptions);
  }
  return viewer;
};

export const viewerResolvers: IResolvers = {
  Query: {
    authUrl: (): string => {
      try {
        return Google.authUrl;
      } catch (error) {
        throw new Error(`Failed to query Google Auth URL: ${error}`);
      }
    },
  },
  Mutation: {
    logIn: async (
      _root: undefined,
      { input }: LoginArgs,
      { db, req, res }: { db: Database; req: Request; res: Response }
    ): Promise<Viewer> => {
      try {
        const code = input ? input.code : null;
        const token = crypto.randomBytes(16).toString("hex");

        const viewer: User | undefined | null = code
          ? await loginViaGoogle(code, token, db, res)
          : await loginViaCookie(token, db, req, res);
        if (!viewer) {
          return { didRequest: true };
        }
        return {
          _id: viewer._id,
          token: viewer.token,
          avatar: viewer.avatar,
          walletId: Boolean(viewer.walletId), //My changes - converted to boolean
          didRequest: true,
        };
      } catch (error) {
        throw new Error(`Failed to login: ${error}`);
      }
    },
    logOut: (
      _root: undefined,
      _args: object,
      { res }: { res: Response }
    ): Viewer => {
      try {
        res.clearCookie("viewer", cookieOptions);
        return {
          didRequest: true,
        };
      } catch (error) {
        throw new Error(`Failed to logout: ${error}`);
      }
    },
  },
  Viewer: {
    id: (viewer: Viewer): string | undefined => {
      return viewer._id;
    },
    hasWallet: (viewer: Viewer): boolean | undefined => {
      return viewer.walletId ? true : undefined;
    },
  },
};
