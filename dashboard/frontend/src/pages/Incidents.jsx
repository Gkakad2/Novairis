import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ArrowDownUp,
  ChevronDown,
  ChevronUp,
  Download,
  RotateCcw,
  X,
} from "lucide-react";

import { getIncidents } from "../services/incidents";
import { getHosts } from "../services/assets";
import { useAutoRefresh } from "../hooks/useAutoRefresh";
import AutoRefreshControl from "../components/common/AutoRefreshControl";
import Pagination from "../components/common/Pagination";
import {
  ControlBar,
  FilterSelect,
  PageHero,
  SortSelect,
} from "../components/common/Controls";
import { formatDateTime, formatRelativeTime } from "../utils/assetHelpers";

const SEVERITY_STYLES = {
  Critical: "bg-rose-500/20 text-rose-300 border-rose-500/30",
  High: "bg-amber-500/20 text-amber-300 border-amber-500/30",
  Medium: "bg-yellow-500/15 text-yellow-200 border-yellow-500/25",
  Low: "bg-slate-500/20 text-slate-300 border-slate-500/30",
};

const SEV_RANK = { Critical: 0, High: 1, Medium: 2, Low: 3 };

const TIME_RANGES = [
  { value: "all", label: "All time", hours: null },
  { value: "24h", label: "Last 24 hours", hours: 24 },
  { value: "7d", label: "Last 7 days", hours: 168 },
  { value: "30d", label: "Last 30 days", hours: 720 },
];

export default function Incidents({ searchQuery = "" }) {
  const [incidents, setIncidents] = useState([]);
  const [hosts, setHosts] = useState([]);
  const [statusFilter, setStatusFilter] = useState("All");
  const [severityFilter, setSeverityFilter] = useState("All");
  const [hostFilter, setHostFilter] = useState("All");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [timeRange, setTimeRange] = useState("all");
  const [sortKey, setSortKey] = useState("timestamp");
  const [sortDir, setSortDir] = useState("desc");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [selected, setSelected] = useState(null);
  const [error, setError] = useState(null);

  const loader = useCallback(async () => {
    setError(null);
    try {
      const [incidentData, hostData] = await Promise.all([
        getIncidents(),
        getHosts(),
      ]);
      setIncidents(incidentData);
      setHosts(hostData);
    } catch (err) {
      console.error(err);
      setError("Failed to load incidents.");
    }
  }, []);

  const {
    autoUpdate,
    setAutoUpdate,
    intervalMs,
    setIntervalMs,
    lastUpdated,
    loading,
    refresh,
  } = useAutoRefresh(loader, { enabled: true, intervalMs: 10000 });

  const hostOptions = useMemo(() => {
    const names = new Set(hosts.map((h) => h.hostname));
    incidents.forEach((i) => names.add(i.hostname));
    return [
      { value: "All", label: "All hosts" },
      ...Array.from(names)
        .sort()
        .map((name) => ({ value: name, label: name })),
    ];
  }, [hosts, incidents]);

  const categoryOptions = useMemo(() => {
    const cats = new Set(incidents.map((i) => i.category).filter(Boolean));
    return [
      { value: "All", label: "All categories" },
      ...Array.from(cats)
        .sort()
        .map((c) => ({ value: c, label: c })),
    ];
  }, [incidents]);

  const filteredRows = useMemo(() => {
    let data = [...incidents];
    const q = searchQuery.trim().toLowerCase();
    const range = TIME_RANGES.find((r) => r.value === timeRange);

    if (statusFilter !== "All") {
      data = data.filter((i) => i.status === statusFilter);
    }
    if (severityFilter !== "All") {
      data = data.filter((i) => i.severity === severityFilter);
    }
    if (hostFilter !== "All") {
      data = data.filter((i) => i.hostname === hostFilter);
    }
    if (categoryFilter !== "All") {
      data = data.filter((i) => i.category === categoryFilter);
    }
    if (range?.hours) {
      const cutoff = Date.now() - range.hours * 3600 * 1000;
      data = data.filter(
        (i) => new Date(i.timestamp || 0).getTime() >= cutoff
      );
    }
    if (q) {
      data = data.filter(
        (i) =>
          String(i.id).includes(q) ||
          i.hostname?.toLowerCase().includes(q) ||
          i.severity?.toLowerCase().includes(q) ||
          i.title?.toLowerCase().includes(q) ||
          i.rule_id?.toLowerCase().includes(q) ||
          i.category?.toLowerCase().includes(q) ||
          i.mitre?.toLowerCase().includes(q) ||
          i.evidence?.toLowerCase().includes(q)
      );
    }

    data.sort((a, b) => {
      let cmp = 0;
      switch (sortKey) {
        case "severity":
          cmp = (SEV_RANK[a.severity] ?? 9) - (SEV_RANK[b.severity] ?? 9);
          break;
        case "hostname":
          cmp = (a.hostname || "").localeCompare(b.hostname || "");
          break;
        case "status":
          cmp = (a.status || "").localeCompare(b.status || "");
          break;
        case "title":
          cmp = (a.title || "").localeCompare(b.title || "");
          break;
        case "id":
          cmp = (a.id || 0) - (b.id || 0);
          break;
        default:
          cmp =
            new Date(a.timestamp || 0).getTime() -
            new Date(b.timestamp || 0).getTime();
      }
      return sortDir === "asc" ? cmp : -cmp;
    });

    return data;
  }, [
    incidents,
    searchQuery,
    statusFilter,
    severityFilter,
    hostFilter,
    categoryFilter,
    timeRange,
    sortKey,
    sortDir,
  ]);

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / pageSize));

  useEffect(() => {
    setPage(1);
  }, [
    searchQuery,
    statusFilter,
    severityFilter,
    hostFilter,
    categoryFilter,
    timeRange,
    pageSize,
    sortKey,
    sortDir,
  ]);

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  const paginatedRows = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredRows.slice(start, start + pageSize);
  }, [filteredRows, page, pageSize]);

  const stats = useMemo(() => {
    const open = filteredRows.filter((i) => i.status === "Open").length;
    const critical = filteredRows.filter((i) => i.severity === "Critical").length;
    const high = filteredRows.filter((i) => i.severity === "High").length;
    const hostsHit = new Set(filteredRows.map((i) => i.hostname)).size;
    const resolved = filteredRows.filter((i) => i.status === "Resolved").length;
    return { open, critical, high, hostsHit, resolved, total: filteredRows.length };
  }, [filteredRows]);

  const hasActiveFilters =
    statusFilter !== "All" ||
    severityFilter !== "All" ||
    hostFilter !== "All" ||
    categoryFilter !== "All" ||
    timeRange !== "all" ||
    searchQuery.trim() !== "";

  function resetFilters() {
    setStatusFilter("All");
    setSeverityFilter("All");
    setHostFilter("All");
    setCategoryFilter("All");
    setTimeRange("all");
    setSortKey("timestamp");
    setSortDir("desc");
    setPage(1);
    setSelected(null);
  }

  function exportVisible() {
    const blob = new Blob([JSON.stringify(filteredRows, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `novairis-incidents-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
  }

  function toggleSort(key) {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir(key === "timestamp" || key === "severity" || key === "id" ? "desc" : "asc");
    }
  }

  function SortHead({ col, children }) {
    const active = sortKey === col;
    return (
      <th className="p-4 text-left">
        <button
          type="button"
          onClick={() => toggleSort(col)}
          className={`inline-flex items-center gap-1.5 font-semibold transition ${
            active ? "text-cyan-300" : "text-slate-300 hover:text-white"
          }`}
        >
          {children}
          {active ? (
            sortDir === "asc" ? <ChevronUp size={14} /> : <ChevronDown size={14} />
          ) : (
            <ArrowDownUp size={12} className="opacity-40" />
          )}
        </button>
      </th>
    );
  }

  return (
    <>
      <PageHero
        title="Incidents"
        subtitle="Investigate detections across the fleet — filter, paginate, and export the current view."
        actions={
          <AutoRefreshControl
            autoUpdate={autoUpdate}
            setAutoUpdate={setAutoUpdate}
            intervalMs={intervalMs}
            setIntervalMs={setIntervalMs}
            lastUpdated={lastUpdated}
            loading={loading}
            onRefresh={() => refresh()}
          />
        }
      />

      {searchQuery.trim() && (
        <div className="mb-4 flex items-center justify-between rounded-xl border border-cyan-400/20 bg-cyan-400/5 px-4 py-2 text-sm text-cyan-200">
          <span>
            Search filter: <strong>{searchQuery}</strong>
          </span>
          <span className="text-xs text-cyan-300/70">
            Clear the search bar and press Enter to show all incidents
          </span>
        </div>
      )}

      <div className="mb-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        <Stat label="In view" value={stats.total} />
        <Stat label="Open" value={stats.open} accent="text-amber-300" />
        <Stat label="Resolved" value={stats.resolved} accent="text-emerald-300" />
        <Stat label="Critical" value={stats.critical} accent="text-rose-300" />
        <Stat label="Affected hosts" value={stats.hostsHit} accent="text-cyan-300" />
      </div>

      <ControlBar>
        <div className="flex flex-wrap items-center gap-3">
          <FilterSelect
            label="Status"
            value={statusFilter}
            onChange={setStatusFilter}
            options={[
              { value: "All", label: "All statuses" },
              { value: "Open", label: "Open" },
              { value: "Resolved", label: "Resolved" },
            ]}
          />
          <FilterSelect
            label="Severity"
            value={severityFilter}
            onChange={setSeverityFilter}
            options={[
              { value: "All", label: "All severities" },
              { value: "Critical", label: "Critical" },
              { value: "High", label: "High" },
              { value: "Medium", label: "Medium" },
              { value: "Low", label: "Low" },
            ]}
          />
          <FilterSelect
            label="Host"
            value={hostFilter}
            onChange={setHostFilter}
            options={hostOptions}
          />
          <FilterSelect
            label="Category"
            value={categoryFilter}
            onChange={setCategoryFilter}
            options={categoryOptions}
          />
          <FilterSelect
            label="Time"
            value={timeRange}
            onChange={setTimeRange}
            options={TIME_RANGES.map((r) => ({
              value: r.value,
              label: r.label,
            }))}
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <SortSelect
            label="Sort"
            value={`${sortKey}:${sortDir}`}
            onChange={(val) => {
              const [key, dir] = val.split(":");
              setSortKey(key);
              setSortDir(dir);
            }}
            options={[
              { value: "timestamp:desc", label: "Newest first" },
              { value: "timestamp:asc", label: "Oldest first" },
              { value: "severity:desc", label: "Severity (high → low)" },
              { value: "severity:asc", label: "Severity (low → high)" },
              { value: "hostname:asc", label: "Host A → Z" },
              { value: "title:asc", label: "Title A → Z" },
              { value: "id:desc", label: "ID (newest)" },
            ]}
          />

          {hasActiveFilters && (
            <button
              type="button"
              onClick={resetFilters}
              className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 px-3 py-2 text-sm text-slate-400 hover:text-white"
            >
              <RotateCcw size={14} />
              Reset filters
            </button>
          )}

          <button
            type="button"
            onClick={exportVisible}
            disabled={filteredRows.length === 0}
            className="inline-flex items-center gap-1.5 rounded-xl border border-cyan-400/30 bg-cyan-400/10 px-3 py-2 text-sm font-medium text-cyan-300 hover:bg-cyan-400/15 disabled:opacity-40"
          >
            <Download size={14} />
            Export view
          </button>
        </div>
      </ControlBar>

      {error && (
        <div className="mb-4 rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-rose-300">
          {error}
        </div>
      )}

      <div className="surface-panel overflow-hidden rounded-2xl">
        <table className="w-full">
          <thead className="border-b border-white/10 bg-black/20">
            <tr>
              <SortHead col="id">ID</SortHead>
              <SortHead col="title">Title</SortHead>
              <SortHead col="hostname">Host</SortHead>
              <th className="p-4 text-left font-semibold text-slate-400">Category</th>
              <th className="p-4 text-left font-semibold text-slate-400">MITRE</th>
              <SortHead col="severity">Severity</SortHead>
              <SortHead col="status">Status</SortHead>
              <SortHead col="timestamp">Detected</SortHead>
            </tr>
          </thead>
          <tbody>
            {paginatedRows.length === 0 ? (
              <tr>
                <td colSpan="8" className="p-10 text-center text-slate-500">
                  {loading
                    ? "Loading incidents..."
                    : "No incidents match the current filters."}
                </td>
              </tr>
            ) : (
              paginatedRows.map((incident, idx) => {
                const isSelected = selected?.id === incident.id;
                const rank = (page - 1) * pageSize + idx + 1;
                return (
                  <tr
                    key={incident.id}
                    onClick={() =>
                      setSelected(isSelected ? null : incident)
                    }
                    className={`cursor-pointer border-b border-white/[0.04] transition hover:bg-white/[0.03] ${
                      isSelected ? "bg-cyan-400/5" : ""
                    }`}
                  >
                    <td className="p-4 font-medium text-slate-500">
                      #{rank}
                    </td>
                    <td className="p-4 font-medium">{incident.title}</td>
                    <td className="p-4 text-cyan-200/90">{incident.hostname}</td>
                    <td className="p-4 text-slate-400">{incident.category}</td>
                    <td className="p-4 text-slate-400">{incident.mitre}</td>
                    <td className="p-4">
                      <span
                        className={`rounded-full border px-3 py-1 text-sm font-semibold ${
                          SEVERITY_STYLES[incident.severity] ||
                          SEVERITY_STYLES.Low
                        }`}
                      >
                        {incident.severity}
                      </span>
                    </td>
                    <td className="p-4">
                      <span
                        className={`rounded-full px-3 py-1 text-sm font-semibold ${
                          incident.status === "Open"
                            ? "bg-amber-500/20 text-amber-300"
                            : "bg-emerald-500/20 text-emerald-300"
                        }`}
                      >
                        {incident.status}
                      </span>
                    </td>
                    <td className="p-4 text-slate-400">
                      <p>{formatRelativeTime(incident.timestamp)}</p>
                      <p className="text-xs text-slate-600">
                        {formatDateTime(incident.timestamp)}
                      </p>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>

        <Pagination
          page={page}
          pageSize={pageSize}
          total={filteredRows.length}
          onPageChange={setPage}
          onPageSizeChange={(size) => {
            setPageSize(size);
            setPage(1);
          }}
          pageSizeOptions={[10, 25, 50, 100]}
        />
      </div>

      {selected && (
        <IncidentDetail
          incident={selected}
          onClose={() => setSelected(null)}
        />
      )}
    </>
  );
}

function IncidentDetail({ incident, onClose }) {
  return (
    <div className="surface-panel mt-5 rounded-2xl p-6">
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-wider text-slate-500">
            Incident #{incident.id}
          </p>
          <h2 className="mt-1 font-display text-xl font-semibold">
            {incident.title}
          </h2>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg border border-white/10 p-2 text-slate-400 hover:text-white"
        >
          <X size={18} />
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Detail label="Host" value={incident.hostname} />
        <Detail label="Severity" value={incident.severity} />
        <Detail label="Status" value={incident.status} />
        <Detail label="Rule" value={incident.rule_id} />
        <Detail label="Category" value={incident.category} />
        <Detail label="MITRE" value={incident.mitre} />
        <Detail label="Detected" value={formatDateTime(incident.timestamp)} />
        <Detail label="Age" value={formatRelativeTime(incident.timestamp)} />
      </div>

      <div className="mt-5">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
          Evidence
        </p>
        <pre className="max-h-48 overflow-auto rounded-xl border border-white/8 bg-black/30 p-4 text-sm text-slate-300 whitespace-pre-wrap break-all">
          {incident.evidence || "No evidence recorded."}
        </pre>
      </div>
    </div>
  );
}

function Detail({ label, value }) {
  return (
    <div className="rounded-xl border border-white/8 bg-black/20 p-3">
      <p className="text-xs text-slate-500">{label}</p>
      <p className="mt-1 text-sm font-medium text-slate-200">{value || "—"}</p>
    </div>
  );
}

function Stat({ label, value, accent = "text-white" }) {
  return (
    <div className="surface-panel rounded-2xl px-5 py-4">
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
        {label}
      </p>
      <p className={`metric-value mt-2 text-3xl font-semibold ${accent}`}>
        {value}
      </p>
    </div>
  );
}
