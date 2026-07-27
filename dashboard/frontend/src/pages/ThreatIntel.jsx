import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  AlertCircle,
  AlertTriangle,
  Clock,
  Info,
  Server,
  ShieldAlert,
} from "lucide-react";

import { getIncidents } from "../services/incidents";
import { useAutoRefresh } from "../hooks/useAutoRefresh";
import AutoRefreshControl from "../components/common/AutoRefreshControl";
import { PageHero } from "../components/common/Controls";

const API_URL = "http://192.168.175.195:5000";

const SEVERITY_COLORS = {
  Critical: "#fb7185",
  High: "#fbbf24",
  Medium: "#fde047",
  Low: "#94a3b8",
};

const SEVERITY_BADGE = {
  Critical: "bg-rose-500/20 text-rose-300 border-rose-500/30",
  High: "bg-amber-500/20 text-amber-300 border-amber-500/30",
  Medium: "bg-yellow-500/20 text-yellow-200 border-yellow-500/30",
  Low: "bg-slate-500/20 text-slate-300 border-slate-500/30",
};

const TOOLTIP = {
  background: "#0b1220",
  border: "1px solid #1e293b",
  borderRadius: 12,
  color: "#e2e8f0",
};

export default function ThreatIntel() {
  const [data, setData] = useState(null);
  const [hostFilter, setHostFilter] = useState("All");
  const [recent, setRecent] = useState([]);

  const loader = useCallback(async () => {
    const scope = hostFilter === "All" ? "" : `&hostname=${encodeURIComponent(hostFilter)}`;
    const [analytics, incidents] = await Promise.all([
      fetch(`${API_URL}/analytics?hours=72${scope}`, { cache: "no-store" }).then((r) => r.json()),
      getIncidents(),
    ]);
    setData(analytics);
    setRecent(incidents);
  }, [hostFilter]);

  const {
    autoUpdate,
    setAutoUpdate,
    intervalMs,
    setIntervalMs,
    lastUpdated,
    loading,
    refresh,
  } = useAutoRefresh(loader, { enabled: true, intervalMs: 10000 });

  const hostNames = data?.host_names || [];

  // reset filter if the selected host stops reporting
  useEffect(() => {
    if (hostFilter !== "All" && data && !hostNames.includes(hostFilter)) {
      setHostFilter("All");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  const mitreData = (data?.by_mitre || []).slice(0, 8);

  const riskRanking = useMemo(() => {
    if (!data?.by_severity_by_host) return null;

    return [...data.by_severity_by_host]
      .filter((row) => row.hostname !== undefined || true)
      .map((row) => {
        const { name, ...severities } = row;
        const total = Object.values(severities).reduce((a, b) => a + b, 0);
        return { hostname: name, ...severities, total };
      })
      .sort((a, b) => b.total - a.total);
  }, [data]);

  const recentCriticalHigh = useMemo(() => {
    return recent
      .filter((i) => i.severity === "Critical" || i.severity === "High")
      .filter((i) => hostFilter === "All" || i.hostname === hostFilter)
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, 8);
  }, [recent, hostFilter]);

  const summary = data?.summary;
  const isFleetView = hostFilter === "All" && hostNames.length > 1;

  return (
    <>
      <PageHero
        title="Threat Intelligence"
        subtitle={
          isFleetView
            ? `MITRE ATT&CK techniques and host risk across ${hostNames.length} hosts.`
            : "MITRE ATT&CK techniques for the selected scope."
        }
        actions={
          <div className="flex items-center gap-3">
            <select
              value={hostFilter}
              onChange={(e) => setHostFilter(e.target.value)}
              className="rounded-xl border border-white/10 bg-slate-900 px-3 py-2 text-sm outline-none focus:border-cyan-500"
            >
              <option value="All">All Hosts ({hostNames.length})</option>
              {hostNames.map((h) => (
                <option key={h} value={h}>{h}</option>
              ))}
            </select>
            <AutoRefreshControl
              autoUpdate={autoUpdate}
              setAutoUpdate={setAutoUpdate}
              intervalMs={intervalMs}
              setIntervalMs={setIntervalMs}
              lastUpdated={lastUpdated}
              loading={loading}
              onRefresh={() => refresh()}
            />
          </div>
        }
      />

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
        <Metric label="Critical" value={summary?.critical} icon={ShieldAlert} accent="text-rose-300" />
        <Metric label="High" value={summary?.high} icon={AlertTriangle} accent="text-amber-300" />
        <Metric label="Medium" value={summary?.medium} icon={AlertCircle} accent="text-yellow-200" />
        <Metric label="Low" value={summary?.low} icon={Info} accent="text-slate-300" />
        <Metric label="Affected Hosts" value={summary?.affected_hosts} icon={Server} accent="text-cyan-300" />
        <Metric label="Open Incidents" value={summary?.open} icon={Clock} accent="text-violet-300" />
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-12">
        <Panel
          className="xl:col-span-12"
          title="Top MITRE ATT&CK techniques"
          subtitle={`Most frequent technique categories in scope${hostFilter !== "All" ? ` — ${hostFilter}` : " — all hosts"}`}
        >
          <div className="h-72">
            {mitreData.length ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={mitreData} layout="vertical" margin={{ left: 4, right: 12 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis type="number" stroke="#64748b" allowDecimals={false} />
                  <YAxis type="category" dataKey="name" stroke="#64748b" width={220} tick={{ fontSize: 12 }} />
                  <Tooltip contentStyle={TOOLTIP} />
                  <Bar dataKey="count" fill="#38bdf8" radius={[0, 8, 8, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <EmptyChart text="No technique data yet" />
            )}
          </div>
        </Panel>

        {isFleetView && riskRanking && (
          <Panel
            className="xl:col-span-12"
            title="Host risk ranking"
            subtitle="Open incidents by severity, per host — highest risk first"
          >
            <div style={{ height: Math.max(riskRanking.length * 44, 160) }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={riskRanking} layout="vertical" stackOffset="sign">
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis type="number" stroke="#64748b" allowDecimals={false} />
                  <YAxis type="category" dataKey="hostname" stroke="#64748b" width={140} tick={{ fontSize: 12 }} />
                  <Tooltip contentStyle={TOOLTIP} />
                  <Bar dataKey="Critical" stackId="risk" fill={SEVERITY_COLORS.Critical} />
                  <Bar dataKey="High" stackId="risk" fill={SEVERITY_COLORS.High} />
                  <Bar dataKey="Medium" stackId="risk" fill={SEVERITY_COLORS.Medium} />
                  <Bar dataKey="Low" stackId="risk" fill={SEVERITY_COLORS.Low} radius={[0, 6, 6, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Panel>
        )}

        <Panel
          className="xl:col-span-12"
          title="Recent critical & high detections"
          subtitle="Latest 8, most recent first"
        >
          {recentCriticalHigh.length === 0 ? (
            <EmptyChart text="No critical or high severity detections" />
          ) : (
            <div className="divide-y divide-white/5">
              {recentCriticalHigh.map((incident) => (
                <div key={incident.id} className="flex items-center justify-between gap-4 py-3">
                  <div className="min-w-0">
                    <p className="truncate font-medium text-slate-200">{incident.title}</p>
                    <p className="mt-0.5 text-xs text-slate-500">
                      {incident.hostname} · {incident.category} · {new Date(incident.timestamp).toLocaleString()}
                    </p>
                  </div>
                  <span className={`shrink-0 rounded-full border px-2.5 py-1 text-xs font-semibold ${SEVERITY_BADGE[incident.severity]}`}>
                    {incident.severity}
                  </span>
                </div>
              ))}
            </div>
          )}
        </Panel>
      </div>

      <div className="surface-panel-soft mt-4 rounded-2xl p-5 text-sm text-slate-500">
        IOC, CVE and hash lookups aren't wired to a live feed yet — this
        page reflects detections produced by NOVAIRIS's own drift-detection
        engine only.
      </div>
    </>
  );
}

function Metric({ label, value, icon: Icon, accent = "text-white" }) {
  return (
    <div className="surface-panel rounded-2xl px-4 py-4">
      <div className="flex items-center justify-between">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">{label}</p>
        {Icon && <Icon size={16} className={accent} />}
      </div>
      <p className={`metric-value mt-2 text-3xl font-semibold ${accent}`}>{value ?? "..."}</p>
    </div>
  );
}

function Panel({ title, subtitle, className = "", children }) {
  return (
    <section className={`surface-panel rounded-2xl p-5 ${className}`}>
      <div className="mb-3">
        <h2 className="font-display text-lg font-semibold text-white">{title}</h2>
        {subtitle && <p className="mt-0.5 text-sm text-slate-500">{subtitle}</p>}
      </div>
      {children}
    </section>
  );
}

function EmptyChart({ text }) {
  return (
    <div className="flex h-full items-center justify-center rounded-xl border border-dashed border-white/10 text-sm text-slate-500">
      {text}
    </div>
  );
}
