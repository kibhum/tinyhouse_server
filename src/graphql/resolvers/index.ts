import merge from "lodash.merge";
import { userResolver } from "./User";
import { viewerResolvers } from "./Viewer";

export const resolvers = merge(userResolver, viewerResolvers);
