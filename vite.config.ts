import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  css: {
    modules: {
      localsConvention: "camelCase",
    },
  },
  test: {
    include: [
      "packages/**/*.test.{ts,tsx}",
      "examples/**/*.test.{ts,tsx}",
    ],
    exclude: ["**/node_modules/**"],
    environment: "jsdom",
  },
});
