import { cpuMonitor } from "../../../utils/cpu";

export async function getSystemStats() {
  const usage = cpuMonitor.getUsage();
  const mem = process.memoryUsage();

  return {
    cpu: usage.cpu,
    memory: Math.round(mem.heapUsed / (1024 * 1024)),
    totalMemory: usage.totalMemory,
    uptime: process.uptime(),
    platform: process.platform,
    bunVersion: Bun.version,
    cpuCores: usage.cpuCores,
    cpuModel: usage.cpuModel,
  };
}
