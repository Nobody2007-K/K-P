/// <reference types="node" />
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  tanstackStart: {
    server: { entry: "server" },
    client: { entry: "client" },
  },

  // Vercel serverless preset — outputs to .vercel/output
  nitro: {
    preset: "vercel",
  },

  vite: {
    // Explicitly load .env.production during `npm run build`
    // so VITE_API_URL is baked into the production bundle.
    envDir: ".",

    server: {
      port: 5173,
      strictPort: false,
      open: true,
      host: "localhost",
    },
  },
});
