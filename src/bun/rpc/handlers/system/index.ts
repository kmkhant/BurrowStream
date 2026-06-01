import { cpuMonitor } from "../../../utils/cpu";
import { networkMonitor } from "../../../utils/network";

// Start CPU monitoring
cpuMonitor.start(2000);

export async function getSystemStats() {
  const usage = cpuMonitor.getUsage();
  const mem = process.memoryUsage();
  const netSpeed = networkMonitor.getSpeed();

  return {
    cpu: usage.cpu,
    memory: Math.round(mem.rss / (1024 * 1024)),
    totalMemory: usage.totalMemory,
    uptime: process.uptime(),
    platform: process.platform,
    bunVersion: Bun.version,
    cpuCores: usage.cpuCores,
    cpuModel: usage.cpuModel,
    network: {
      downloadMbps: netSpeed.downloadMbps,
      uploadMbps: netSpeed.uploadMbps, // In a movie streamer, upload denotes out-bound streaming egress to clients
      interface: networkMonitor.getInterfaceName(), // Helps identify active hardware profile
    },
  };
}
