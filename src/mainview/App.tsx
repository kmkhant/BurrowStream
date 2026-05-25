export default function App() {
  return (
    <div className="min-h-screen bg-[#0A0A0A] text-zinc-100 font-sans antialiased">
      {/* Header Bar */}
      <header className="sticky top-0 z-50 border-b border-white/[0.04] bg-[#0A0A0A]/80 backdrop-blur-xl">
        <div className="flex items-center justify-between h-12 px-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div>LG</div>
              <span className="text-xs font-medium text-zinc-400">
                BurrowStream
              </span>
            </div>
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-white/[0.04] text-zinc-500 border border-white/[0.04]">
              v0.1.0
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 pr-3 mr-3 border-r border-white/[0.04]">
              <span className="relative flex size-1.5">
                <span className="animate-ping absolute inline-flex size-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full size-1.5 bg-red-500"></span>
              </span>
              <span className="text-[11px] text-zinc-500">Server Offline</span>
            </div>
            <button className="text-[11px] px-3 py-1.5 rounded-md bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.04] transition-colors">
              Docs
            </button>
            <button className="text-[11px] px-3 py-1.5 rounded-md bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.04] transition-colors">
              Settings
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto p-6 space-y-4">
        {/* Quick Actions Row */}
        <div className="grid grid-cols-3 gap-3">
          {/* Server Control */}
          <div className="col-span-2 bg-white/[0.02] border border-white/[0.04] rounded-lg p-4 hover:bg-white/[0.03] transition-colors">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xs font-medium text-zinc-300">
                  Streaming Server
                </h3>
                <p className="text-[11px] text-zinc-500 mt-0.5">
                  Host your videos on the local network
                </p>
              </div>
              <button className="text-[11px] font-medium px-3 py-1.5 rounded-md bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/10 transition-colors">
                Start Server
              </button>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="bg-white/[0.02] border border-white/[0.04] rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-md bg-white/[0.03]">
                <svg
                  className="size-3.5 text-zinc-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M2.25 15a4.5 4.5 0 004.5 4.5H18a3.75 3.75 0 001.332-7.257 3 3 0 00-3.758-3.848 5.25 5.25 0 00-10.233 2.33A4.502 4.502 0 002.25 15z"
                  />
                </svg>
              </div>
              <div>
                <div className="text-xs font-medium text-zinc-300">
                  0 videos
                </div>
                <div className="text-[10px] text-zinc-500">in library</div>
              </div>
            </div>
          </div>
        </div>

        {/* Library Section */}
        <div className="bg-white/[0.02] border border-white/[0.04] rounded-lg overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b border-white/[0.04]">
            <div>
              <h3 className="text-xs font-medium text-zinc-300">
                Media Library
              </h3>
              <p className="text-[10px] text-zinc-500 mt-0.5">
                Your video collection
              </p>
            </div>
            <button className="flex items-center gap-1.5 text-[11px] px-3 py-1.5 rounded-md bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.04] transition-colors">
              <svg
                className="size-3"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4.5v15m7.5-7.5h-15"
                />
              </svg>
              Add Folder
            </button>
          </div>

          {/* Empty State */}
          <div className="flex flex-col items-center justify-center py-12 px-4">
            <div className="p-3 rounded-full bg-white/[0.03] mb-3">
              <svg
                className="size-5 text-zinc-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1}
                  d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0 0 22.5 18.75V5.25A2.25 2.25 0 0 0 20.25 3H3.75A2.25 2.25 0 0 0 1.5 5.25v13.5A2.25 2.25 0 0 0 3.75 21Z"
                />
              </svg>
            </div>
            <p className="text-xs text-zinc-500 mb-2">No videos added yet</p>
            <p className="text-[11px] text-zinc-600 text-center max-w-sm">
              Add folders containing your video files to start streaming them to
              your devices
            </p>
          </div>
        </div>

        {/* Activity Section */}
        <div className="bg-white/[0.02] border border-white/[0.04] rounded-lg overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b border-white/[0.04]">
            <div>
              <h3 className="text-xs font-medium text-zinc-300">Activity</h3>
              <p className="text-[10px] text-zinc-500 mt-0.5">
                Recent server events
              </p>
            </div>
            <button className="text-[10px] text-zinc-500 hover:text-zinc-400 transition-colors">
              Clear all
            </button>
          </div>
          <div className="divide-y divide-white/[0.04]">
            {/* Activity items would go here */}
            <div className="px-4 py-3">
              <div className="flex items-start gap-3">
                <div className="p-1 rounded bg-white/[0.03] mt-0.5">
                  <div className="size-1.5 rounded-full bg-zinc-700"></div>
                </div>
                <div>
                  <p className="text-[11px] text-zinc-500">Server started</p>
                  <p className="text-[10px] text-zinc-600 mt-0.5">
                    2 minutes ago
                  </p>
                </div>
              </div>
            </div>
            <div className="px-4 py-3">
              <div className="flex items-start gap-3">
                <div className="p-1 rounded bg-white/[0.03] mt-0.5">
                  <div className="size-1.5 rounded-full bg-zinc-700"></div>
                </div>
                <div>
                  <p className="text-[11px] text-zinc-500">Scan completed</p>
                  <p className="text-[10px] text-zinc-600 mt-0.5">
                    5 minutes ago
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
