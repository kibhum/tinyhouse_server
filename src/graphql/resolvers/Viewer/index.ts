import { IResolvers } from "@graphql-tools/utils";

export const viewerResolvers: IResolvers = {
  Query: {
    authUrl: () => {
      return "Query.AuthUrl";
    },
  },
  Mutation: {
    logIn: () => {
      return "Mutation.LogIn";
    },
    logOut: () => {
      return "Mutation.logOut";
    },
  },
};
