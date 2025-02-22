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
import { connectDB } from "@app/common";
import * as dotenv from "dotenv";
import router from "./reservations.routes";
import RabbitMQ from "@app/common/utils/rabbitmq";

dotenv.config();

const app: Express = express();
app.use(express.json());

connectDB(process.env.MONGODB_URI!);
(async () => {
  await RabbitMQ.getInstance();
})();

app.use('/', router);

app.listen(3001);
