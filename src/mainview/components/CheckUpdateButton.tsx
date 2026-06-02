import { cn } from "../lib/utils";
import type { UpdateStatusChangedResponse } from "../../shared/rpc/definitions";

interface UpdateButtonProps {
  status: UpdateStatusChangedResponse | null;
  onCheck: () => void;
  onApply: () => void;
  className?: string;
  isDark: boolean;
}

export function CheckUpdateButton({
  status,
  onCheck,
  onApply,
  className,
  isDark,
}: UpdateButtonProps) {
  const state = status?.state ?? "idle";

  let label: string;
  let buttonClass: string;
  let title: string | undefined;

  switch (state) {
    case "idle":
      label = "Check Updates";
      buttonClass = cn(
        "bg-[var(--bg-elevated)] hover:bg-[var(--bg-hover)] border-[var(--border-subtle)]",
        isDark ? "text-zinc-400" : "text-zinc-600",
      );
      break;
    case "checking":
      label = "Checking…";
      buttonClass = cn(
        "bg-[var(--bg-elevated)] border-[var(--border-subtle)]",
        isDark ? "text-zinc-400" : "text-zinc-600",
        className ?? "",
      );
      break;
    case "downloading":
      label = "Downloading…";
      buttonClass = cn(
        "bg-[var(--bg-elevated)] border-[var(--border-subtle)]",
        isDark ? "text-zinc-400" : "text-zinc-600",
        className ?? "",
      );
      break;
    case "available":
      label = `Update v${status?.version ?? ""}`;
      buttonClass = cn(
        "bg-blue-500/10 hover:bg-blue-500/20 border-blue-500/30",
        isDark ? "text-zinc-400" : "text-zinc-600",
        className ?? "",
      );
      break;
    case "ready":
      label = "Restart to Update";
      buttonClass = cn(
        "bg-emerald-500/10 hover:bg-emerald-500/20 border-emerald-500/30",
        isDark ? "text-zinc-400" : "text-zinc-600",
        className ?? "",
      );
      break;
    case "error":
      label = "Update Failed";
      buttonClass = cn(
        "bg-red-500/10 hover:bg-red-500/20 border-red-500/20",
        isDark ? "text-zinc-400" : "text-zinc-600",
        className ?? "",
      );
      title = status?.error ?? undefined;
      break;
    default:
      label = "Check Updates";
      buttonClass = cn(
        "bg-[var(--bg-elevated)] hover:bg-[var(--bg-hover)] border-[var(--border-subtle)]",
        isDark ? "text-zinc-400" : "text-zinc-600",
        className ?? "",
      );
  }

  return (
    <button
      onClick={() => {
        if (state === "idle" || state === "error") return onCheck();
        if (state === "available" || state === "ready") return onApply();
      }}
      disabled={state === "checking" || state === "downloading"}
      title={title}
      className={cn(
        "text-[11px] px-2 py-1.5 rounded-md border transition-colors min-w-[6.5rem]",
        buttonClass,
        className ?? "",
      )}
    >
      {label}
    </button>
  );
}
