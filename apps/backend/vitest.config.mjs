import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

const configDir = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  resolve: {
    alias: {
      "@": resolve(configDir, "src"),
    },
  },
  test: {
    include: ["src/**/*.spec.ts", "tests/**/*.spec.ts"],
    // Repository integration specs share one Postgres database and truncate
    // tables in `beforeEach`; running spec files in parallel races those
    // truncations against each other. Sequential files keep them isolated.
    fileParallelism: false,
  },
});
