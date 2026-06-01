// utils/network.ts
import { readFileSync } from "fs";
import { execSync } from "child_process";

interface NetStats {
  rxBytes: number;
  txBytes: number;
}

class NetworkMonitor {
  private lastRx = 0;
  private lastTx = 0;
  private lastTime = Date.now();
  private interfaceName = "";

  constructor() {
    this.determinePrimaryInterface();
    this.snap();
  }

  private determinePrimaryInterface() {
    const platform = process.platform;
    try {
      if (platform === "linux") {
        // Find the first non-loopback interface routing traffic
        const route = readFileSync("/proc/net/route", "utf8");
        const lines = route.split("\n");
        for (let i = 1; i < lines.length; i++) {
          const columns = lines[i].split("\t");
          if (columns[1] === "00000000") {
            // Default gateway route
            this.interfaceName = columns[0];
            return;
          }
        }
      } else if (platform === "darwin") {
        // Force en0 for local physical interface debugging on macOS,
        // or fallback to gateway determination if en0 isn't present.
        this.interfaceName = "en0";
        return;
      }
    } catch (e) {
      // Fallback defaults if routing table parsing fails
      this.interfaceName = platform === "linux" ? "wlan0" : "en0";
    }
  }

  private getRawCounters(): NetStats {
    const stats = { rxBytes: 0, txBytes: 0 };
    const platform = process.platform;

    try {
      if (platform === "linux") {
        const devFile = readFileSync("/proc/net/dev", "utf8");
        const lines = devFile.split("\n");
        for (const line of lines) {
          if (line.includes(this.interfaceName)) {
            const parts = line.trim().split(/:\s*/)[1].split(/\s+/);
            stats.rxBytes = parseInt(parts[0], 10); // Receive bytes
            stats.txBytes = parseInt(parts[8], 10); // Transmit bytes
            break;
          }
        }
      } else if (platform === "darwin") {
        // Execute netstat explicitly requesting byte counter statistics
        const output = execSync(`netstat -bI ${this.interfaceName}`).toString();
        const lines = output.trim().split("\n");

        if (lines.length > 1) {
          // lines[0] -> Headers
          // lines[1] -> Typically contains the <Link#X> hardware counter metrics
          // We isolate the line containing the Link configuration
          const linkLine = lines.find((line) => line.includes("<Link"));

          if (linkLine) {
            const parts = linkLine.trim().split(/\s+/);

            // Standard macOS Column Positions for -bI flag:
            // parts[0]: Name (e.g., en0)
            // parts[1]: Mtu
            // parts[2]: Network (e.g., <Link#4>)
            // parts[3]: Address (MAC address)
            // parts[4]: Ibytes (Received Bytes) -> index 4
            // parts[5]: Ipkts
            // parts[6]: Obytes (Transmitted Bytes) -> index 6

            stats.rxBytes = parseInt(parts[4], 10) || 0;
            stats.txBytes = parseInt(parts[6], 10) || 0;
          }
        }
      }
    } catch (error) {
      // Log or suppress internal parsing issues during state transition
    }
    return stats;
  }

  private snap() {
    const current = this.getRawCounters();
    this.lastRx = current.rxBytes;
    this.lastTx = current.txBytes;
    this.lastTime = Date.now();
  }

  public getSpeed() {
    const now = Date.now();
    const current = this.getRawCounters();

    const durationSec = (now - this.lastTime) / 1000;
    if (durationSec <= 0) return { downloadMbps: 0, uploadMbps: 0 };

    const rxDelta = current.rxBytes - this.lastRx;
    const txDelta = current.txBytes - this.lastTx;

    // Direct rolling updates
    this.lastRx = current.rxBytes;
    this.lastTx = current.txBytes;
    this.lastTime = now;

    // Convert bytes to Megabits per second (Mbps) for convenient bandwidth auditing
    // Formula: (Bytes * 8) / (1024 * 1024) / seconds
    return {
      downloadMbps:
        Math.round(((rxDelta * 8) / (1024 * 1024) / durationSec) * 100) / 100,
      uploadMbps:
        Math.round(((txDelta * 8) / (1024 * 1024) / durationSec) * 100) / 100,
    };
  }

  public getInterfaceName() {
    return this.interfaceName;
  }
}

export const networkMonitor = new NetworkMonitor();
