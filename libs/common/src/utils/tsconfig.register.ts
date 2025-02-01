import { register } from "tsconfig-paths";
import { resolve } from "path";

export const registerPaths = () => {
  register({
    baseUrl: resolve(process.cwd(), "dist"),
    paths: {
      "@app/common": ["libs/common/src"],
      "@app/common/*": ["libs/common/src/*"],
    },
  });
};
