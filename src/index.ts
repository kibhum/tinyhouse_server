import dotenv from "dotenv";
import CookieParser from "cookie-parser";
dotenv.config({ path: "./config.env" });
import express, { Application } from "express";
import { ApolloServer } from "apollo-server-express";
import { typeDefs, resolvers } from "./graphql";
import { connectDatabase } from "./database";

const mount = async (app: Application) => {
  const db = await connectDatabase();
  app.use(CookieParser(process.env.SECRET));
  const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: ({ req, res }) => ({ req, res, db }),
  });
  await server.start();
  server.applyMiddleware({ app, path: "/api" });
  app.listen(process.env.PORT, () => {
    console.log(`Server running on ${process.env.PORT}`);
    console.log(
      `GraphQL Server running on http://localhost:${process.env.PORT}/api`
    );
  });
};
mount(express());
