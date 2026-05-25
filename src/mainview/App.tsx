import { useState } from "react";

function App() {
  const [count, setCount] = useState(0);

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans">
      {/* Header – draggable area */}
      <div className="fixed top-0 left-0 right-0 h-12 bg-zinc-900/80 backdrop-blur flex items-center justify-between px-4 drag-region">
        <span className="font-semibold text-zinc-100">BurrowStream Server</span>
        <div className="flex gap-2 no-drag">
          <button className="w-8 h-8 rounded hover:bg-zinc-700">–</button>
          <button className="w-8 h-8 rounded hover:bg-zinc-700">□</button>
          <button className="w-8 h-8 rounded hover:bg-red-600">×</button>
        </div>
      </div>

      <div className="pt-12 p-6 space-y-6">
        {/* Server Status Card */}
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-5">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full bg-red-500`} />
              <span className="font-mono text-sm">Not running</span>
            </div>
            <div className="flex gap-2">
              <button className="px-4 py-2 rounded-lg font-medium transition bg-green-600 hover:bg-green-700 text-white">
                Start Server
              </button>
              <button
                disabled
                className="px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 disabled:opacity-50"
              >
                Open Web Client
              </button>
            </div>
          </div>
        </div>

        {/* Watched Folders */}
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-5">
          <h2 className="text-lg font-semibold mb-3">Watched Folders</h2>
          <div className="space-y-2">
            <button className="w-full mt-2 border border-dashed border-zinc-700 rounded-lg py-2 text-zinc-400 hover:text-zinc-300 hover:border-zinc-500 transition">
              + Add Folder
            </button>
          </div>
        </div>

        {/* Scan Controls */}
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-5">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium disabled:opacity-50">
              Scan Now
            </button>
            <div className="text-sm text-zinc-400">Last scan: Never</div>
          </div>
        </div>

        {/* Activity Log (collapsible) */}
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-5">
          <div className="flex items-center justify-between cursor-pointer select-none">
            <h2 className="text-lg font-semibold">Activity Log</h2>
            <span className="text-zinc-400">▲</span>
          </div>
          <div className="mt-3 space-y-1 max-h-64 overflow-y-auto font-mono text-xs">
            <div className="text-zinc-500">No logs yet.</div>
            <div className="flex gap-2 pt-2">
              <button className="text-xs text-zinc-400 hover:text-white">
                Clear Log
              </button>
              <button className="text-xs text-zinc-400 hover:text-white">
                Export
              </button>
            </div>
          </div>
        </div>

        {/* Footer Stats */}
        <div className="text-xs text-zinc-500 text-center border-t border-zinc-800 pt-4">
          Version 0.1.0 | CPU: 0% | RAM: 0 MB
        </div>
      </div>
    </div>
  );
}

export default App;
