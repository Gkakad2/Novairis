import { useEffect, useState } from "react";
import {
  Download,
  FileJson,
  History,
  Server,
  ShieldAlert,
  TrendingUp,
} from "lucide-react";

import { getAssets } from "../services/assets";
import { getIncidents } from "../services/incidents";
import { getDashboardSummary } from "../services/dashboardService";
import { PageHero } from "../components/common/Controls";

function downloadJson(filename, data) {
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

const REPORTS = [
  {
    id: "assets",
    title: "Asset Inventory",
    description: "Full snapshot of every monitored endpoint and its current state.",
    icon: Server,
    fetcher: getAssets,
  },
  {
    id: "incidents",
    title: "Incident Summary",
    description: "All recorded incidents, open and resolved, across every host.",
    icon: ShieldAlert,
    fetcher: () => getIncidents(),
  },
  {
    id: "analytics",
    title: "Analytics Report",
    description: "Severity, category, MITRE and timeline breakdowns for the last 72h.",
    icon: TrendingUp,
    fetcher: () =>
      fetch("http://192.168.175.195:5000/analytics?hours=72", { cache: "no-store" })
        .then((r) => r.json()),
  },
  {
    id: "summary",
    title: "Security Overview",
    description: "Fleet-wide KPIs: host count, security health, open incidents.",
    icon: FileJson,
    fetcher: getDashboardSummary,
  },
];

export default function Reports() {
  const [snapshot, setSnapshot] = useState(null);
  const [generating, setGenerating] = useState(null);
  const [error, setError] = useState(null);
  const [history, setHistory] = useState([]);

  useEffect(() => {
    async function loadSnapshot() {
      try {
        const [assets, incidents, summary] = await Promise.all([
          getAssets(),
          getIncidents(),
          getDashboardSummary(),
        ]);
        setSnapshot({
          hosts: assets.length,
          incidents: incidents.length,
          open: incidents.filter((i) => i.status === "Open").length,
          health: summary?.security_health ?? null,
        });
      } catch (err) {
        console.error("Reports snapshot error:", err);
      }
    }
    loadSnapshot();
  }, []);

  async function generate(report) {
    setGenerating(report.id);
    setError(null);

    try {
      const data = await report.fetcher();
      const stamp = new Date();
      const filename = `novairis-${report.id}-${stamp
        .toISOString()
        .replace(/[:.]/g, "-")}.json`;

      downloadJson(filename, data);

      setHistory((prev) => [
        { id: report.id, title: report.title, filename, at: stamp },
        ...prev,
      ].slice(0, 8));
    } catch (err) {
      console.error(err);
      setError(`Failed to generate ${report.title}.`);
    } finally {
      setGenerating(null);
    }
  }

  return (
    <>
      <PageHero
        title="Reports"
        subtitle="Export live fleet data for offline review or sharing."
      />

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Metric label="Hosts" value={snapshot?.hosts} icon={Server} accent="text-cyan-300" />
        <Metric label="Total Incidents" value={snapshot?.incidents} icon={ShieldAlert} accent="text-violet-300" />
        <Metric label="Open" value={snapshot?.open} icon={ShieldAlert} accent="text-amber-300" />
        <Metric
          label="Security Health"
          value={snapshot?.health != null ? `${snapshot.health}%` : null}
          icon={TrendingUp}
          accent="text-emerald-300"
        />
      </div>

      {error && (
        <div className="mt-4 rounded-xl border border-rose-500/30 bg-rose-500/10 p-4 text-rose-300">
          {error}
        </div>
      )}

      <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-12">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:col-span-8">
          {REPORTS.map((report) => {
            const Icon = report.icon;
            return (
              <div key={report.id} className="surface-panel flex flex-col justify-between rounded-2xl p-5">
                <div>
                  <div className="flex items-center gap-2">
                    <Icon size={18} className="text-cyan-300" />
                    <h2 className="font-display text-lg font-semibold text-white">
                      {report.title}
                    </h2>
                  </div>
                  <p className="mt-2 text-sm text-slate-400">{report.description}</p>
                </div>

                <button
                  onClick={() => generate(report)}
                  disabled={generating === report.id}
                  className="mt-5 flex items-center justify-center gap-2 rounded-xl bg-cyan-600 px-4 py-3 text-sm font-semibold transition hover:bg-cyan-500 disabled:opacity-50"
                >
                  <Download size={15} />
                  {generating === report.id ? "Generating..." : "Download JSON"}
                </button>
              </div>
            );
          })}
        </div>

        <Panel className="xl:col-span-4" title="Recent Exports" subtitle="This session only">
          {history.length === 0 ? (
            <div className="flex h-40 flex-col items-center justify-center text-center text-sm text-slate-500">
              <History size={22} className="mb-2 text-slate-600" />
              Nothing exported yet.
            </div>
          ) : (
            <div className="space-y-2">
              {history.map((h, i) => (
                <div
                  key={i}
                  className="rounded-lg bg-white/[0.03] px-3 py-2 text-sm"
                >
                  <p className="truncate font-medium text-slate-200">{h.title}</p>
                  <p className="mt-0.5 truncate text-xs text-slate-500">
                    {h.at.toLocaleTimeString()} · {h.filename}
                  </p>
                </div>
              ))}
            </div>
          )}
        </Panel>
      </div>

      <div className="surface-panel-soft mt-4 rounded-2xl p-5 text-sm text-slate-500">
        PDF/CSV export and scheduled report delivery aren't built yet —
        these buttons pull live data straight from the API and download it
        as JSON.
      </div>
    </>
  );
}

function Metric({ label, value, icon: Icon, accent = "text-white" }) {
  return (
    <div className="surface-panel rounded-2xl px-4 py-4">
      <div className="flex items-center justify-between">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
          {label}
        </p>
        {Icon && <Icon size={16} className={accent} />}
      </div>
      <p className={`metric-value mt-2 text-3xl font-semibold ${accent}`}>
        {value ?? "..."}
      </p>
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
