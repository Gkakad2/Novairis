import { useEffect, useRef, useState } from "react";
import { ChevronDown, Pause, Play, RefreshCw } from "lucide-react";

const INTERVALS = [
  { label: "Every 5 seconds", ms: 5000 },
  { label: "Every 10 seconds", ms: 10000 },
  { label: "Every 30 seconds", ms: 30000 },
  { label: "Every 1 minute", ms: 60000 },
];

function labelFor(ms) {
  return INTERVALS.find((opt) => opt.ms === ms)?.label || "Every 10 seconds";
}

export default function AutoRefreshControl({
  autoUpdate,
  setAutoUpdate,
  intervalMs,
  setIntervalMs,
  lastUpdated,
  loading,
  onRefresh,
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);

  useEffect(() => {
    function onDocClick(e) {
      if (rootRef.current && !rootRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  function pickInterval(ms) {
    setIntervalMs(ms);
    setAutoUpdate(true);
    setOpen(false);
  }

  function refreshNow() {
    onRefresh?.();
    setOpen(false);
  }

  return (
    <div ref={rootRef} className="relative flex flex-wrap items-center gap-2">
      <button
        type="button"
        onClick={() => setAutoUpdate(!autoUpdate)}
        className={`inline-flex items-center gap-2 rounded-full border px-3.5 py-2 text-sm font-medium transition ${
          autoUpdate
            ? "border-emerald-400/40 bg-emerald-400/10 text-emerald-300"
            : "border-white/10 bg-white/5 text-slate-400 hover:border-white/20"
        }`}
      >
        {autoUpdate ? <Pause size={14} /> : <Play size={14} />}
        {autoUpdate ? "Live" : "Paused"}
      </button>

      <div className="relative">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3.5 py-2 text-sm font-medium text-slate-300 transition hover:border-cyan-400/40 hover:text-cyan-300"
        >
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          Refresh
          <ChevronDown size={14} className={`transition ${open ? "rotate-180" : ""}`} />
        </button>

        {open && (
          <div className="absolute right-0 top-[calc(100%+8px)] z-30 min-w-[220px] overflow-hidden rounded-xl border border-white/10 bg-[#0b1220] py-1 shadow-2xl">
            <button
              type="button"
              onClick={refreshNow}
              disabled={loading}
              className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm text-white hover:bg-white/5 disabled:opacity-50"
            >
              <RefreshCw size={14} />
              Refresh now
            </button>

            <div className="my-1 border-t border-white/8" />

            <p className="px-4 py-2 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              Auto refresh
            </p>

            {INTERVALS.map((opt) => (
              <button
                key={opt.ms}
                type="button"
                onClick={() => pickInterval(opt.ms)}
                className={`flex w-full px-4 py-2.5 text-left text-sm transition hover:bg-white/5 ${
                  intervalMs === opt.ms && autoUpdate
                    ? "text-cyan-300"
                    : "text-slate-300"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        )}
      </div>

      <span className="rounded-full border border-white/10 bg-black/20 px-3 py-1.5 text-xs text-slate-400">
        {autoUpdate ? labelFor(intervalMs) : "Manual refresh"}
      </span>

      {lastUpdated && (
        <span className="text-xs text-slate-500">
          Updated {lastUpdated.toLocaleTimeString()}
        </span>
      )}
    </div>
  );
}
