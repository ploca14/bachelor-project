import { defineVitestConfig } from "@nuxt/test-utils/config";

export default defineVitestConfig({
  test: {
    coverage: {
      include: ["server/**/*.ts"],
      exclude: [
        "server/lib/**/*.ts",
        "server/handlers/query/**/*.ts",
        "server/queries/**/*.ts",
      ],
    },
  },
});
