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
import router from "./routes";
import DatabaseConnection from "@app/common/utils/connectDB";

dotenv.config();

const app: Express = express();
app.use(express.json());
(async () => {
  await DatabaseConnection.getInstance();
  await RabbitMQ.getInstance();
})();

app.use("/transactions", router);

app.listen(3002);
