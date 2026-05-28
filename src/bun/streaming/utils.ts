import { networkInterfaces } from "os";

export async function getLocalIP() {
  const nets = networkInterfaces();
  for (const name of Object.keys(nets)) {
    for (const net of nets[name]!) {
      if (net.family === "IPv4" && !net.internal) {
        return { ip: net.address };
      }
    }
  }
  return { ip: "localhost" };
}
