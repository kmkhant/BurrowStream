import { BrowserView } from "electrobun";
import { rpcHandlers } from "../../bun/rpc/handlers";
import { MainRPC } from "./schema";

export const mainRpc = BrowserView.defineRPC<MainRPC>({
  maxRequestTime: 5000,
  handlers: {
    requests: {
      ping: rpcHandlers.ping,
      getFolders: rpcHandlers.getFolders,
      addFolder: rpcHandlers.addFolder,
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
