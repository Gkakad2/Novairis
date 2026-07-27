import { useCallback, useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { getAnalytics } from "../services/analytics";
import { useAutoRefresh } from "../hooks/useAutoRefresh";
import AutoRefreshControl from "../components/common/AutoRefreshControl";
import {
  ControlBar,
  FilterChip,
  HostSelect,
  PageHero,
  SortSelect,
} from "../components/common/Controls";

const SEVERITY_COLORS = {
  Critical: "#fb7185",
  High: "#fbbf24",
  Medium: "#fde047",
  Low: "#94a3b8",
};

const STATUS_COLORS = {
  Open: "#fbbf24",
  Resolved: "#34d399",
};

const TOOLTIP = {
  background: "#0b1220",
  border: "1px solid #1e293b",
  borderRadius: 12,
  color: "#e2e8f0",
};

const RANGES = [
  { label: "24h", hours: 24 },
  { label: "72h", hours: 72 },
  { label: "7d", hours: 168 },
];

const EMPTY = {
  summary: {
    total_incidents: 0,
    open: 0,
    resolved: 0,
    critical: 0,
    high: 0,
    medium: 0,
    low: 0,
    affected_hosts: 0,
    monitored_hosts: 0,
  },
  by_severity: [],
  by_category: [],
  by_status: [],
  by_host: [],
  by_mitre: [],
  timeline: [],
  resource_trends: [],
  hosts: [],
};

export default function Analytics() {
  const [data, setData] = useState(EMPTY);
  const [hostname, setHostname] = useState("All");
  const [hours, setHours] = useState(72);
  const [hostSort, setHostSort] = useState("count");
  const [error, setError] = useState(null);

  const loader = useCallback(async () => {
    setError(null);
    try {
      const result = await getAnalytics({
        hostname: hostname === "All" ? null : hostname,
        hours,
      });
      setData(result);
    } catch (err) {
      console.error(err);
      setError("Failed to load analytics.");
    }
  }, [hostname, hours]);

  const {
    autoUpdate,
    setAutoUpdate,
    intervalMs,
    setIntervalMs,
    lastUpdated,
    loading,
    refresh,
  } = useAutoRefresh(loader, {
    enabled: true,
    intervalMs: 15000,
    deps: [hostname, hours],
  });

  const summary = data.summary || EMPTY.summary;

  const hostRows = useMemo(() => {
    const rows = [...(data.by_host || [])];
    if (hostSort === "name") {
      rows.sort((a, b) => a.name.localeCompare(b.name));
    } else {
      rows.sort((a, b) => b.count - a.count);
    }
    return rows;
  }, [data.by_host, hostSort]);

  const hostOptions = useMemo(() => {
    const names = new Set((data.hosts || []).map((h) => h.hostname));
    (data.by_host || []).forEach((h) => names.add(h.name));
    return Array.from(names).sort();
  }, [data]);

  const openRate =
    summary.total_incidents > 0
      ? Math.round((summary.open / summary.total_incidents) * 100)
      : 0;

  return (
    <>
      <PageHero
        title="Analytics"
        subtitle="Live fleet signal — incident volume, severity mix, and host pressure in one view."
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

      <ControlBar>
        <div className="flex flex-wrap items-center gap-2">
          <HostSelect
            value={hostname}
            onChange={setHostname}
            hosts={hostOptions}
            allLabel="Entire Fleet"
          />

          <div className="mx-1 h-5 w-px bg-white/10" />

          {RANGES.map((opt) => (
            <FilterChip
              key={opt.hours}
              active={hours === opt.hours}
              onClick={() => setHours(opt.hours)}
            >
              {opt.label}
            </FilterChip>
          ))}
        </div>

        <SortSelect
          label="Hosts"
          value={hostSort}
          onChange={setHostSort}
          options={[
            { value: "count", label: "By volume" },
            { value: "name", label: "A → Z" },
          ]}
        />
      </ControlBar>

      {error && (
        <div className="mb-6 rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-rose-300">
          {error}
        </div>
      )}

      {/* Bento KPI strip */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
        <Metric
          label="Incidents"
          value={summary.total_incidents}
          hint={`${hours}h window`}
        />
        <Metric label="Open" value={summary.open} accent="text-amber-300" hint={`${openRate}% open`} />
        <Metric label="Resolved" value={summary.resolved} accent="text-emerald-300" />
        <Metric label="Critical" value={summary.critical} accent="text-rose-300" />
        <Metric label="High" value={summary.high} accent="text-amber-200" />
        <Metric
          label={hostname === "All" ? "Hosts hit" : "Scoped"}
          value={hostname === "All" ? summary.affected_hosts : hostname}
          accent="text-cyan-300"
          compact={hostname !== "All"}
        />
      </div>

      {/* Asymmetric main grid */}
      <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-12">
        <Panel className="xl:col-span-8" title="Incident timeline" subtitle="Hourly volume + critical overlay">
          <div className="h-72">
            {(data.timeline || []).some((t) => t.total > 0) ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data.timeline || []}>
                  <defs>
                    <linearGradient id="nvFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#22d3ee" stopOpacity={0.4} />
                      <stop offset="100%" stopColor="#22d3ee" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="label" stroke="#64748b" tick={{ fontSize: 11 }} minTickGap={36} />
                  <YAxis stroke="#64748b" allowDecimals={false} width={36} />
                  <Tooltip contentStyle={TOOLTIP} />
                  <Area type="monotone" dataKey="total" stroke="#22d3ee" fill="url(#nvFill)" strokeWidth={2} name="Total" />
                  <Area type="monotone" dataKey="critical" stroke="#fb7185" fill="transparent" strokeWidth={1.5} name="Critical" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <EmptyChart text="No incidents in this window" />
            )}
          </div>
        </Panel>

        <Panel className="xl:col-span-4" title="Severity mix" subtitle="Ordered Critical → Low">
          <div className="h-72">
            {(data.by_severity || []).length ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data.by_severity}
                    dataKey="count"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={58}
                    outerRadius={92}
                    paddingAngle={3}
                  >
                    {data.by_severity.map((entry) => (
                      <Cell key={entry.name} fill={SEVERITY_COLORS[entry.name] || "#38bdf8"} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={TOOLTIP} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <EmptyChart text="No severity data" />
            )}
          </div>
          <div className="mt-1 flex flex-wrap gap-2">
            {(data.by_severity || []).map((s) => (
              <span
                key={s.name}
                className="rounded-full border border-white/10 px-2.5 py-1 text-xs text-slate-300"
              >
                <span
                  className="mr-1.5 inline-block h-2 w-2 rounded-full"
                  style={{ background: SEVERITY_COLORS[s.name] }}
                />
                {s.name} · {s.count}
              </span>
            ))}
          </div>
        </Panel>

        <Panel className="xl:col-span-4" title="Status" subtitle="Open vs resolved">
          <div className="h-56">
            {(data.by_status || []).length ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.by_status}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="name" stroke="#64748b" />
                  <YAxis stroke="#64748b" allowDecimals={false} width={32} />
                  <Tooltip contentStyle={TOOLTIP} />
                  <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                    {data.by_status.map((entry) => (
                      <Cell key={entry.name} fill={STATUS_COLORS[entry.name] || "#38bdf8"} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <EmptyChart text="No status data" />
            )}
          </div>
        </Panel>

        <Panel className="xl:col-span-8" title="By category" subtitle="Detection categories in scope">
          <div className="h-56">
            {(data.by_category || []).length ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.by_category}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="name" stroke="#64748b" tick={{ fontSize: 11 }} interval={0} angle={-15} textAnchor="end" height={50} />
                  <YAxis stroke="#64748b" allowDecimals={false} width={32} />
                  <Tooltip contentStyle={TOOLTIP} />
                  <Bar dataKey="count" fill="#22d3ee" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <EmptyChart text="No category data" />
            )}
          </div>
        </Panel>

        <Panel
          className="xl:col-span-5"
          title="Host volume"
          subtitle={hostname === "All" ? "Compare endpoints" : `Scoped to ${hostname}`}
        >
          <div className="h-64">
            {hostRows.length ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={hostRows} layout="vertical" margin={{ left: 4, right: 12 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis type="number" stroke="#64748b" allowDecimals={false} />
                  <YAxis type="category" dataKey="name" stroke="#64748b" width={100} tick={{ fontSize: 12 }} />
                  <Tooltip contentStyle={TOOLTIP} />
                  <Bar dataKey="count" fill="#67e8f9" radius={[0, 8, 8, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <EmptyChart text="No host incidents" />
            )}
          </div>
        </Panel>

        <Panel className="xl:col-span-7" title="Resource trends" subtitle={hostname === "All" ? "Fleet-averaged CPU / memory" : `${hostname} CPU / memory`}>
          <div className="h-64">
            {(data.resource_trends || []).length ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data.resource_trends}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="label" stroke="#64748b" tick={{ fontSize: 11 }} minTickGap={32} />
                  <YAxis stroke="#64748b" domain={[0, 100]} unit="%" width={40} />
                  <Tooltip contentStyle={TOOLTIP} />
                  <Line type="monotone" dataKey="cpu" stroke="#22d3ee" strokeWidth={2} dot={false} name="CPU %" />
                  <Line type="monotone" dataKey="memory" stroke="#34d399" strokeWidth={2} dot={false} name="Memory %" />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <EmptyChart text="No telemetry in this window" />
            )}
          </div>
        </Panel>

        {(data.by_mitre || []).length > 0 && (
          <Panel className="xl:col-span-12" title="MITRE ATT&CK" subtitle="Technique frequency in the selected window">
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.by_mitre} layout="vertical" margin={{ left: 4, right: 12 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis type="number" stroke="#64748b" allowDecimals={false} />
                  <YAxis type="category" dataKey="name" stroke="#64748b" width={120} tick={{ fontSize: 12 }} />
                  <Tooltip contentStyle={TOOLTIP} />
                  <Bar dataKey="count" fill="#38bdf8" radius={[0, 8, 8, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Panel>
        )}
      </div>
    </>
  );
}

function Metric({ label, value, accent = "text-white", hint, compact = false }) {
  return (
    <div className="surface-panel rounded-2xl px-4 py-4">
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
        {label}
      </p>
      <p
        className={`metric-value mt-2 font-semibold ${accent} ${
          compact ? "truncate text-lg" : "text-3xl"
        }`}
        title={String(value)}
      >
        {value ?? 0}
      </p>
      {hint && <p className="mt-1 text-xs text-slate-500">{hint}</p>}
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
