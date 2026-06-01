import type { ElectrobunConfig } from "electrobun";

export default {
  app: {
    name: "Burrow Stream",
    identifier: "com.burrowstream.app",
    version: "0.0.1",
  },
  runtime: {
    exitOnLastWindowClosed: true,
  },
  build: {
    useAsar: true,
    asarUnpack: ["*.node", "*.dll", "*.dylib", "*.so"],
    bun: {
      entrypoint: "src/bun/index.ts",
    },
    views: {
      mainview: {
        entrypoint: "src/mainview/main.tsx",
      },
      player: {
        entrypoint: "src/player/main.tsx",
      },
    },
    // Vite builds to dist/, we copy from there
    copy: {
      "dist/index.html": "views/mainview/index.html",
      "dist/assets": "views/mainview/assets",

      // Player build
      "dist-player/index.html": "views/player-dist/index.html",
      "dist-player/assets": "views/player-dist/assets",
    },
    // Ignore Vite output in watch mode — HMR handles view rebuilds separately
    watchIgnore: ["dist/**", "dist-player/**", "**/*.generated.*"],
    mac: {
      codesign: false, // Disable automated Apple Developer ID checks
      notarize: false, // Disable Apple Notarization checks
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
