import { createServer } from "../../../streaming/server";
import { getLocalIP } from "../../../streaming/utils";

import logger from "../../../logger";

let streamingServer: ReturnType<typeof createServer> | null = null;
let serverStartTime: number | null = null;

export async function startServer(params: { port?: number }) {
  if (streamingServer) {
    logger.error("Server already running");
    return { success: false, error: "Server already running" };
  }

  const port = params.port || 8080;
  streamingServer = createServer(port);
  serverStartTime = Date.now();

  logger.info(`Server started on port ${port}`);

  // get the local IP
  let ip = "localhost";
  try {
    const ipResult = await getLocalIP();
    ip = ipResult.ip;
  } catch (error) {
    console.error(error);
    logger.warn("Could not determine local IP, using localhost");
  }

  return { success: true, port: streamingServer.port, ip };
}

export async function stopServer() {
  if (!streamingServer) {
    return { success: false, error: "Server not running" };
  }
  streamingServer.stop(true);
  streamingServer = null;
  serverStartTime = null;
  return { success: true };
}

export async function getServerStatus(): Promise<{
  running: boolean;
  port: number | null;
  uptime: number;
}> {
  return {
    running: streamingServer !== null,
    port: streamingServer?.port || null,
    uptime: serverStartTime ? Date.now() - serverStartTime : 0,
  };
}
