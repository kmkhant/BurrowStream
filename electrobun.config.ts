import type { ElectrobunConfig } from "electrobun";

export default {
  app: {
    name: "burrow-stream",
    identifier: "kmkhant.burrowstream.app",
    version: "0.0.1",
  },
  build: {
    // Vite builds to dist/, we copy from there
    copy: {
      "dist/index.html": "views/mainview/index.html",
      "dist/assets": "views/mainview/assets",

      // Player build
      "dist-player/index.html": "views/player-dist/index.html",
      "dist-player/assets": "views/player-dist/assets",
    },
    // Ignore Vite output in watch mode — HMR handles view rebuilds separately
    watchIgnore: ["dist/**", "dist-player/**"],
    mac: {
      bundleCEF: false,
    },
    linux: {
      bundleCEF: false,
    },
    win: {
      bundleCEF: false,
    },
  },
} satisfies ElectrobunConfig;
