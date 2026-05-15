import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    globals: true,
    include: ["client/src/**/*.test.ts", "client/src/**/*.test.tsx"],
  },
  resolve: {
    alias: {
      "@": "/client/src",
    },
  },
});
