Here is the updated, production-ready `README.md` configured to match our exact single-workspace `package.json` scripts, the Bun backend streaming architecture, and the streamlined "select folder to stream" desktop user experience.

---

# `README.md`

```markdown
# BurrowStream 🎬

BurrowStream is a lightweight, high-performance Local Area Network (LAN) video streaming application built on Bun and Electrobun. It turns any home laptop or desktop PC into a centralized media server instantly.

End users can stream their video library across their home network simply by **launching the app and selecting a media folder**. Any device on the same Wi-Fi or Ethernet network—such as smartphones, tablets, smart TVs, or other computers—can immediately access, browse, and stream the files directly through a web browser with zero configuration.

---

## ⚡ Features

- **Instant Folder Streaming:** No complex setups—just select a local folder from your PC to instantly populate your network-wide video catalog.
- **High-Performance Streaming Channels:** Uses a custom Bun-backend utilizing native file-slicing to deliver true HTTP `206 Partial Content` video streams (instant scrubbing, seeking, and lower buffer overhead).
- **Zero Client Installation:** Remote devices connect instantly via any standard modern web browser—no client-side apps or extra configurations required.
- **Layout-Stabilized Player View:** A fluid, fully responsive user interface built to eliminate Cumulative Layout Shift (CLS) across varying mobile and desktop displays.
- **Instant QR Connect:** Automatically detects your host machine's local LAN IP address and generates an absolute-contrast dashboard QR code for instant mobile pairing.
- **SQLite Metrics Tracking:** Transparently logs operational stats, gathering duration markers, file formats, and historical play counts.

---

## 📐 Architecture & Network Topology

BurrowStream handles admin control interfaces and high-throughput media transport side-by-side, routing traffic safely over your home intranet.
```

```
   [ Host PC / Streaming Device ]
   +----------------------------+
   |   BurrowStream Core App    | <--- (User selects a media folder)
   |  (SQLite DB + Bun Backend)  |
   +--------------+-------------+
                  |
                  v [Distributes HTTP Traffic]
     +------------+------------+
     | Local Network Router/AP |
     +------------+------------+
                  |
+-----------------+-----------------+
| (Wi-Fi)                           | (Ethernet)
v                                   v

```

+---+-------------------+ +---+-------------------+
| Mobile Phones / Pods | | Desktop PC / Smart TV |
| (Safari / Chrome) | | (Native Media Player) |
+-----------------------+ +-----------------------+

````

---

## 🚀 Getting Started

### Prerequisites
* **Runtime Engine:** [Bun](https://bun.sh) (v1.x recommended)
* **Development Packages:** Node.js (v22+ for the frontend compilation pipelines)

### 1. Installation
Clone the project repository and run the single-workspace installation command directly from the project root:

```bash
# Clone the repository
git clone [https://github.com/your-username/burrowstream.git](https://github.com/your-username/burrowstream.git)
cd burrowstream

# Install all workspace dependencies
bun install

````

### 2. Database Initialization

Before running the server instance for the first time, prepare your internal metadata tracking database:

```bash
# Generate the schema configurations and push them to your local SQLite cluster
bun run db:generate
bun run db:push

```

### 3. Development Workflow (with HMR Proxies)

To spin up development servers for testing changes with real-time Hot Module Replacement:

```bash
# For making changes to the main desktop dashboard view (Port 5173)
bun run dev:admin

# For making changes to the remote web player stream view (Port 5174)
bun run dev:player

```

### 4. Production Build & Execution

To compile all viewports down into optimized production static bundles and launch the desktop environment wrapper:

```bash
bun run start

```

---

## 📱 How to Connect Other Devices

Once BurrowStream is running on your host machine, use the main interface to choose a target folder. The **Local Network Access Dashboard** will display live metrics.

1. **Verify Network Connectivity:** Ensure that your host computer and your playback devices (phones, tablets) are connected to the **same local network router**.
2. **Scan the QR Code:** Open the native camera app on your phone or tablet and point it at the QR Code displayed at the center of the application dashboard window.
3. **Manual Entry:** Alternatively, copy or type the raw network link string shown in the admin controller (e.g., `http://192.168.1.45:8080`) directly into your remote browser's URL address bar.

---

## 🛠️ Diagnostics & Troubleshooting

- **Vite Proxy Timeout Exceptions (`ECONNRESET`):** If you hit network socket disconnect errors while coding inside development HMR modes, verify that video stream asset requests aren't leaking through your frontend dev server paths. Our proxy routers automatically scrub downstream `Range` media headers to preserve connection pool stability.
- **Connection Timeout on Clients:** If remote clients fail to resolve the link address, check that your host computer's OS Firewall allows inbound TCP traffic through port `8080`.
- **Public vs. Private Network Profiles:** Ensure your host laptop's Wi-Fi profile is set to **Private**. Operating systems intentionally block local machine discovery channels on "Public" Wi-Fi pathways for security.

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for details.

```
***

### Updates Implemented:
* Added a clear summary explaining that the application works via a simple folder-selection mechanism.
* Rewrote the **Installation** guide into a one-step command (`bun install`), aligning it with our flat, single-workspace structure.
* Standardized all execution examples to target our exact script hooks (`bun run dev:player`, `bun run dev:admin`, `bun run start`).
* Linked the structural `ECONNRESET` proxy patch into the development troubleshooting checklist for future reference.

```
