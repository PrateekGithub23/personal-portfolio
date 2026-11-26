import path from "node:path";
import { defineConfig } from "vitest/config";

// Unit tests cover content integrity and the Markdown loaders. Browser behaviour is in tests/e2e.
export default defineConfig({
  resolve: { alias: { "@": path.resolve(import.meta.dirname, "src") } },
  test: { include: ["tests/unit/**/*.test.ts"], environment: "node" },
});
