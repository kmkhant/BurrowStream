// src/bun/utils/cpu.ts
import { cpus, totalmem } from "node:os";

interface CPUInfo {
  model: string;
  speed: number;
  times: {
    user: number;
    nice: number;
    sys: number;
    idle: number;
    irq: number;
  };
}

interface CPUUsage {
  cpu: number;
  memory: number;
  totalMemory: number;
  cpuCores: number;
  cpuModel: string;
}

export class CPUMonitor {
  private previousCPUs: CPUInfo[] = [];
  private interval: ReturnType<typeof setInterval> | null = null;
  private currentUsage: CPUUsage = {
    cpu: 0,
    memory: 0,
    totalMemory: 0,
    cpuCores: 0,
    cpuModel: "",
  };

  constructor() {
    const cpuInfo = cpus();
    this.currentUsage.cpuCores = cpuInfo.length;
    this.currentUsage.cpuModel = cpuInfo[0]?.model || "Unknown";
    this.currentUsage.totalMemory = Math.round(totalmem() / (1024 * 1024));
  }

  /**
   * Start monitoring CPU usage at the given interval.
   */
  start(intervalMs: number = 1000): void {
    // Take initial snapshot
    this.previousCPUs = cpus();

    this.interval = setInterval(() => {
      this.calculateCPUUsage();
      this.calculateMemoryUsage();
    }, intervalMs);
  }

  /**
   * Stop monitoring CPU usage.
   */
  stop(): void {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
  }

  /**
   * Get the current CPU and memory usage.
   */
  getUsage(): CPUUsage {
    return { ...this.currentUsage };
  }

  /**
   * Calculate CPU usage by comparing current and previous CPU times.
   */
  private calculateCPUUsage(): void {
    const currentCPUs = cpus();

    if (this.previousCPUs.length === 0) {
      this.previousCPUs = currentCPUs;
      return;
    }

    let totalIdle = 0;
    let totalTick = 0;

    for (let i = 0; i < currentCPUs.length; i++) {
      const prev = this.previousCPUs[i];
      const curr = currentCPUs[i];

      if (!prev || !curr) continue;

      const prevIdle = prev.times.idle + prev.times.irq;
      const currIdle = curr.times.idle + curr.times.irq;

      const prevTotal =
        prev.times.user +
        prev.times.nice +
        prev.times.sys +
        prev.times.idle +
        prev.times.irq;

      const currTotal =
        curr.times.user +
        curr.times.nice +
        curr.times.sys +
        curr.times.idle +
        curr.times.irq;

      totalIdle += currIdle - prevIdle;
      totalTick += currTotal - prevTotal;
    }

    this.previousCPUs = currentCPUs;

    if (totalTick === 0) {
      this.currentUsage.cpu = 0;
      return;
    }

    const percentage = (totalIdle / totalTick) * 100;
    const cpuUsage = 100 - percentage;

    this.currentUsage.cpu = cpuUsage;
  }

  /**
   * Calculate current memory usage.
   */
  private calculateMemoryUsage(): void {
    const used = process.memoryUsage();
    this.currentUsage.memory = Math.round(used.heapUsed / (1024 * 1024));
  }
}

// Singleton instance
export const cpuMonitor = new CPUMonitor();
