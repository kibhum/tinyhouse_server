import express from "express";
import { ApolloServer } from "apollo-server-express";
import { schema } from "./graphql";

const app = express();
const port = 9000;
const server = new ApolloServer({ schema });
(async () => {
  await server.start();
  server.applyMiddleware({ app, path: "/api" });
})();
app.listen(port, () => {
  console.log(`Server running on ${port}`);
});
