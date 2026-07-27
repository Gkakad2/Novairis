import React from "react";

export default function AssetToolbar({
  statusFilter,
  setStatusFilter,
  osFilter,
  setOsFilter,
  sortBy,
  setSortBy,
  refresh,
  refreshing = false,
  lastUpdated = null,
}) {
  return (
    <div className="mb-8">
      <div className="grid grid-cols-4 gap-4">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-xl border border-slate-700 bg-slate-900 px-4 py-3"
        >
          <option value="All">All Status</option>
          <option value="Online">Online</option>
          <option value="Offline">Offline</option>
        </select>

        <select
          value={osFilter}
          onChange={(e) => setOsFilter(e.target.value)}
          className="rounded-xl border border-slate-700 bg-slate-900 px-4 py-3"
        >
          <option value="All">All Operating Systems</option>
          <option value="Linux">Linux</option>
          <option value="Windows">Windows</option>
        </select>

        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="rounded-xl border border-slate-700 bg-slate-900 px-4 py-3"
        >
          <option value="hostname">Sort by Hostname</option>
          <option value="cpu">Sort by CPU Usage</option>
          <option value="memory">Sort by Memory Usage</option>
          <option value="processes">Sort by Processes</option>
        </select>

        <button
          onClick={refresh}
          disabled={refreshing}
          className="flex items-center justify-center gap-2 rounded-xl bg-cyan-600 px-4 py-3 font-semibold transition hover:bg-cyan-500 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {refreshing && (
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
          )}
          {refreshing ? "Refreshing..." : "Refresh Inventory"}
        </button>
      </div>

      {lastUpdated && (
        <p className="mt-2 text-right text-xs text-slate-500">
          Last updated: {lastUpdated.toLocaleTimeString()}
        </p>
      )}
    </div>
  );
}
