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

dotenv.config();

const app: Express = express();

connectDB(process.env.MONGODB_URI!);

app.listen(3001);
