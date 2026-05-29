import { cpuMonitor } from "../../../utils/cpu";

// Start CPU monitoring
cpuMonitor.start(2000);

export async function getSystemStats() {
  const usage = cpuMonitor.getUsage();
  const mem = process.memoryUsage();

  return {
    cpu: usage.cpu,
    memory: Math.round(mem.rss / (1024 * 1024)),
    totalMemory: usage.totalMemory,
    uptime: process.uptime(),
    platform: process.platform,
    bunVersion: Bun.version,
    cpuCores: usage.cpuCores,
    cpuModel: usage.cpuModel,
  };
}
