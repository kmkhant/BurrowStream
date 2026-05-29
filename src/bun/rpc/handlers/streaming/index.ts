// src/bun/rpc/handlers/server.ts
import { z } from "zod";
import logger from "../../../logger";
import { createServer } from "../../../streaming/server";
import { getLocalIP } from "../../../streaming/utils";

// Import our new unified schemas and types
import { StartServerRequest } from "../../../../shared/rpc/definitions";
import type {
  ServerStatusResponse,
  StartStreamingServerResponse,
  SuccessResponse,
} from "../../../../shared/rpc/definitions";

let streamingServer: ReturnType<typeof createServer> | null = null;
let serverStartTime: number | null = null;
let serverIp: string | null = null;

/**
 * Starts the background streaming server
 */
export async function startServer(
  params: z.infer<typeof StartServerRequest>,
): Promise<StartStreamingServerResponse & { error?: string }> {
  if (streamingServer) {
    logger.error("Server already running");
    return {
      success: false,
      error: "Server already running",
      port: streamingServer.port || 8080,
      ip: serverIp || "localhost",
    };
  }

  const port = params.port || 8080;
  streamingServer = createServer(port);
  serverStartTime = Date.now();

  logger.info(`Server started on port ${port}`);

  // Determine the local IP layout securely
  let ip = "localhost";
  try {
    const ipResult = await getLocalIP();
    ip = ipResult.ip;
  } catch (error) {
    logger.warn("Could not determine local IP, defaulting to localhost");
    console.error(error);
  }

  serverIp = ip;

  return {
    success: true,
    port: streamingServer.port || 8080,
    ip,
  };
}

/**
 * Stops the running streaming server instance
 */
export async function stopServer(): Promise<SuccessResponse> {
  if (!streamingServer) {
    return { success: false, error: "Server not running" };
  }

  streamingServer.stop(true);
  streamingServer = null;
  serverStartTime = null;
  serverIp = null;

  return { success: true };
}

/**
 * Retrieves full runtime network diagnostics for the streaming layer
 */
export async function getServerStatus(): Promise<ServerStatusResponse> {
  const isRunning = streamingServer !== null;
  const currentPort = streamingServer?.port || null;
  const currentIp = isRunning ? serverIp || "localhost" : null;

  return {
    running: isRunning,
    port: currentPort,
    uptime: serverStartTime ? Date.now() - serverStartTime : 0,
    ip: currentIp,
    url:
      isRunning && currentPort && currentIp
        ? `http://${currentIp}:${currentPort}`
        : null,
  };
}
