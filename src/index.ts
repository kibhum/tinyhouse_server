import dotenv from "dotenv";
dotenv.config({ path: "./config.env" });
import express, { Application } from "express";
import { ApolloServer } from "apollo-server-express";
import { typeDefs, resolvers } from "./graphql";
import { connectDatabase } from "./database";

const mount = async (app: Application) => {
  const db = await connectDatabase();
  const server = new ApolloServer({ typeDefs, resolvers, context: { db } });
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
