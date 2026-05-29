import { useState } from "react";

import { ActivityLogResponse } from "../../shared/rpc/definitions";

import { timeAgo } from "../utils";

interface ActivityLogProps {
  activityLogs: ActivityLogResponse[];
}

const ActivityLog = ({ activityLogs }: ActivityLogProps) => {
  const [showActivity, setShowActivity] = useState(false);

  return (
    <div className="bg-white/[0.02] border border-white/[0.04] rounded-lg overflow-hidden">
      <div
        className="flex items-center justify-between p-4 border-b border-white/[0.04] cursor-pointer"
        onClick={() => setShowActivity(!showActivity)}
      >
        <div>
          <h3 className="text-xs font-medium text-[var(--text-primary)]">
            Activity
          </h3>
          <p className="text-[10px] text-[var(--text-secondary)] mt-0.5">
            Recent server events
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-zinc-600">
            {showActivity ? "Hide" : "Show"}
          </span>
          <button className="text-[10px] text-zinc-500 hover:text-zinc-400 transition-colors">
            Clear all
          </button>
        </div>
      </div>
      {showActivity && (
        <div className="divide-y divide-white/[0.04] max-h-48 overflow-y-auto">
          {activityLogs.length === 0 ? (
            <div className="px-4 py-6 text-center">
              <p className="text-[11px] text-zinc-500">No activity yet</p>
            </div>
          ) : (
            activityLogs.map((log) => (
              <div key={log.id} className="px-4 py-3">
                <div className="flex items-start gap-3">
                  <div className="p-1 rounded bg-white/[0.03] mt-0.5">
                    <div
                      className={`size-1.5 rounded-full ${
                        log.level === "error"
                          ? "bg-red-500"
                          : log.level === "warn"
                            ? "bg-amber-500"
                            : "bg-zinc-700"
                      }`}
                    />
                  </div>
                  <div>
                    <p className="text-[11px] text-zinc-500">{log.message}</p>
                    <p className="text-[10px] text-zinc-600 mt-0.5">
                      {timeAgo(log.createdAt)}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default ActivityLog;
