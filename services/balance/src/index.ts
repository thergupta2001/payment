import { register } from "tsconfig-paths";
import { resolve } from "path";

register({
  baseUrl: resolve(process.cwd(), "dist"),
  paths: {
    "@app/common": ["libs/common/src"],
    "@app/common/*": ["libs/common/src/*"],
  },
});

import express, { Express } from "express";
import * as dotenv from "dotenv";
import RabbitMQ from "@app/common/utils/rabbitmq";
import { connectDB } from "@app/common";
import consumeBalance from "./services/balanceConsumer";

dotenv.config();

const app: Express = express();
app.use(express.json());
(async () => {
  await connectDB(process.env.MONGODB_URI!);
  await RabbitMQ.getInstance();
})();

consumeBalance()
  .then(() => {
    console.log("Transaction consumer started");
  })
  .catch((err) => {
    console.error("Error starting transaction consumer:", err);
  });

app.listen(3001);