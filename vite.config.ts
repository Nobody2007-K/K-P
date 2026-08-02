/// <reference types="node" />
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  tanstackStart: {
    server: { entry: "server" },
    client: { entry: "client" },
  },

  // Target Vercel's edge/serverless runtime
  nitro: {
    preset: "vercel",
  },

  vite: {
    server: {
      port: 5173,
      strictPort: false,
      open: true,
      host: "localhost",
    },
  },
});
