import { Request } from "express";
import { Database, User } from "../types";
export const authorize = (db: Database, req: Request): Promise<User | null> => {
  const token = req.get("X-CSRF-Token");
  const viewer = db.users.findOne({ _id: req.signedCookies.viewer, token });
  return viewer;
};
