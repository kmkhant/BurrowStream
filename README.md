# BurrowStream

**BurrowStream** is a lightweight, high-performance LAN video streaming application built with **Bun** and **Electrobun**. Turn any laptop or desktop PC into a centralized media server instantly — just launch the app, select a media folder, and start streaming to any device on your home network.

---

## ✨ Features

- **Instant Folder Selection** – No complex setup. Pick a local folder and your media catalog is instantly available network-wide.
- **High-Performance Streaming** – Custom Bun backend with native file slicing, supporting HTTP `206 Partial Content` for seamless scrubbing and seeking.
- **Zero Client Installation** – Any device with a modern browser can connect immediately — no extra apps or configuration.
- **Stable, CLS-Free Player** – Responsive UI designed to eliminate layout shifts across mobile and desktop.
- **QR Code Connect** – Automatically detects your LAN IP and generates a QR code for instant mobile pairing.
- **SQLite Analytics** – Tracks play counts, duration, file formats, and other metrics transparently.

---

## 🏗️ Architecture

```
[ Host PC / Media Server ]
       │
       ▼
[ Bun Backend + SQLite ]
       │
       ▼
[ Local Network Router / AP ]
       │
       ┌─────────────┴─────────────┐
       ▼                           ▼
[ Phones / Tablets ]       [ Smart TVs / Other PCs ]
   (via Wi-Fi)                  (via Ethernet)
```

---

## 🚀 Getting Started

### Prerequisites
- [Bun](https://bun.sh) (v1.x recommended)
- Node.js (v22+ for frontend compilation, if needed)

### 1. Clone & Install

```bash
git clone https://github.com/your-username/burrowstream.git
cd burrowstream
bun install
```

### 2. Initialize Database

```bash
bun run db:generate
bun run db:push
```

### 3. Development Mode (with HMR)

```bash
# Admin dashboard (port 5173)
bun run dev:admin

# Remote player view (port 5174)
bun run dev:player
```

### 4. Production Build & Run

```bash
bun run start
```

---

## 📱 Connecting Remote Devices

Once BurrowStream is running on your host machine:

1. **Same network** – Ensure all devices are connected to the same local router (Wi-Fi or Ethernet).
2. **Scan QR code** – Use your phone’s camera app to scan the QR code displayed in the BurrowStream dashboard.
3. **Manual URL** – Type the shown network address (e.g., `http://192.168.1.45:8080`) into any browser on the same network.

---

## 🛠️ Troubleshooting

| Issue | Solution |
|-------|----------|
| `ECONNRESET` in dev mode | Our proxy handles `Range` headers; ensure you’re not accidentally streaming video through the Vite dev server. |
| Remote clients cannot connect | Check your OS firewall – allow inbound TCP traffic on **port 8080**. |
| Connection fails on Windows/macOS | Set your Wi-Fi profile to **Private** (not Public) to allow local network discovery. |

---

## 📄 License

Distributed under the **MIT License**. See `LICENSE` for details.
