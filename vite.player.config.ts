import path from "node:path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  root: "src/player",
  build: {
    outDir: path.resolve(__dirname, "dist-player"),
    emptyOutDir: true,
  },
});
