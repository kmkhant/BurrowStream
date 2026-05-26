import { BrowserView, BrowserWindow, Updater } from "electrobun/bun";

import type { MainRPC } from "../shared/rpc/types";
import { rpcHandlers } from "./rpc/handlers";

const DEV_SERVER_PORT = 5173;
const DEV_SERVER_URL = `http://localhost:${DEV_SERVER_PORT}`;

// Check if Vite dev server is running for HMR
async function getMainViewUrl(): Promise<string> {
  const channel = await Updater.localInfo.channel();
  if (channel === "dev") {
    try {
      await fetch(DEV_SERVER_URL, { method: "HEAD" });
      console.log(`HMR enabled: Using Vite dev server at ${DEV_SERVER_URL}`);
      return DEV_SERVER_URL;
    } catch {
      console.log(
        "Vite dev server not running. Run 'bun run dev:hmr' for HMR support.",
      );
    }
  }
  return "views://mainview/index.html";
}

// Create the main application window
const url = await getMainViewUrl();

const mainRpc = BrowserView.defineRPC<MainRPC>({
  maxRequestTime: 5000,
  handlers: {
    requests: {
      ping: rpcHandlers.ping,
      selectFolder: rpcHandlers.selectFolder,
    },
    messages: {
      log: ({ msg }) => {
        console.log("[Webview]:", msg);
      },
      scanProgress: (data) => {
        console.log("Scan progress:", data);
      },
    },
  },
});

const mainWindow = new BrowserWindow({
  title: "Burrow Stream",
  url,
  frame: {
    width: 900,
    height: 700,
    x: 200,
    y: 200,
  },
  rpc: mainRpc,
  sandbox: false,
});

// Handle window events
mainWindow.on("close", () => {
  console.log("Main window closed");
  process.exit(0);
});

mainWindow.webview.on("dom-ready", () => {
  console.log("Webview DOM ready");
});

console.log("Burrow has been started!");
