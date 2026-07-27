import { useCallback, useState } from "react";
import {
  Activity,
  Info,
  Server,
  ShieldCheck,
  Trash2,
  Wifi,
  WifiOff,
} from "lucide-react";

import { getHosts, deleteHost } from "../services/hosts";
import { useAutoRefresh } from "../hooks/useAutoRefresh";
import AutoRefreshControl from "../components/common/AutoRefreshControl";
import { PageHero } from "../components/common/Controls";

const API_URL = "http://192.168.175.195:5000";
const ONLINE_THRESHOLD_MS = 120 * 1000;

// Demo hosts aren't backed by a real agent, so their last_seen timestamp
// is set once at creation and never refreshed — a pure time-since check
// would show them as "Offline" within minutes even though they're meant
// to represent an active fleet member. Match the backend's rule: demo
// hosts always read as online.
function isOnline(host) {
  if (host.is_demo) return true;
  if (!host.last_seen) return false;
  return Date.now() - new Date(host.last_seen).getTime() <= ONLINE_THRESHOLD_MS;
}

export default function Settings() {
  const [health, setHealth] = useState(null);
  const [healthOk, setHealthOk] = useState(false);
  const [hosts, setHosts] = useState([]);

  const [deletingHost, setDeletingHost] = useState(null);

  const loader = useCallback(async () => {
    const [healthRes, hostRows] = await Promise.all([
      fetch(`${API_URL}/`, { cache: "no-store" })
        .then((r) => (r.ok ? r.json() : Promise.reject(new Error("bad status"))))
        .then((data) => {
          setHealthOk(true);
          return data;
        })
        .catch(() => {
          setHealthOk(false);
          return null;
        }),
      getHosts(),
    ]);
    setHealth(healthRes);
    setHosts(hostRows);
  }, []);

  const {
    autoUpdate,
    setAutoUpdate,
    intervalMs,
    setIntervalMs,
    lastUpdated,
    loading,
    refresh,
  } = useAutoRefresh(loader, { enabled: true, intervalMs: 15000 });

  async function handleDeleteHost(hostname) {
    if (!window.confirm(`Remove demo host "${hostname}" and all its seeded data?`)) {
      return;
    }
    setDeletingHost(hostname);
    try {
      await deleteHost(hostname);
      await refresh();
    } catch (err) {
      alert(err.message);
    } finally {
      setDeletingHost(null);
    }
  }

  const onlineCount = hosts.filter((h) => isOnline(h)).length;
  const demoHosts = hosts.filter((h) => h.is_demo);

  return (
    <>
      <PageHero
        title="Settings"
        subtitle="Backend connectivity, demo data management and system information."
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

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Metric label="Backend" value={healthOk ? "Online" : "Offline"} icon={healthOk ? Wifi : WifiOff} accent={healthOk ? "text-emerald-300" : "text-rose-300"} />
        <Metric label="Hosts Tracked" value={hosts.length} icon={Server} accent="text-cyan-300" />
        <Metric label="Online Now" value={onlineCount} icon={Activity} accent="text-violet-300" />
        <Metric label="Demo Hosts" value={demoHosts.length} icon={ShieldCheck} accent="text-amber-300" />
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-12">
        <Panel
          className="xl:col-span-7"
          title="Demo Data Management"
          subtitle="Seeded hosts that don't have a real agent — remove them here when you're done with a demo."
        >
          {demoHosts.length === 0 ? (
            <div className="rounded-xl border border-dashed border-white/10 p-6 text-center text-sm text-slate-500">
              No demo hosts right now. Add one from the Dashboard's "Add host" action
              to seed sample telemetry, processes and incidents.
            </div>
          ) : (
            <div className="overflow-hidden rounded-xl border border-white/10">
              <table className="w-full text-sm">
                <thead className="bg-white/[0.03] text-left text-xs uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="p-3">Hostname</th>
                    <th className="p-3">IP</th>
                    <th className="p-3">OS</th>
                    <th className="p-3">Seeded</th>
                    <th className="p-3" />
                  </tr>
                </thead>
                <tbody>
                  {demoHosts.map((h) => (
                    <tr key={h.hostname} className="border-t border-white/5">
                      <td className="p-3 font-medium">
                        {h.hostname}
                        <span className="ml-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-[10px] font-semibold uppercase text-amber-300">
                          Demo
                        </span>
                      </td>
                      <td className="p-3 text-slate-400">{h.ip}</td>
                      <td className="p-3 text-slate-400">{h.os}</td>
                      <td className="p-3 text-slate-500">
                        {h.first_seen ? new Date(h.first_seen).toLocaleString() : "—"}
                      </td>
                      <td className="p-3 text-right">
                        <button
                          onClick={() => handleDeleteHost(h.hostname)}
                          disabled={deletingHost === h.hostname}
                          className="rounded-lg border border-rose-500/30 p-1.5 text-rose-400 transition hover:bg-rose-500/10 disabled:opacity-50"
                          title="Delete demo host"
                        >
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <p className="mt-3 text-xs text-slate-500">
            Looking for real, live-agent hosts? Manage those on the{" "}
            <span className="text-slate-400">Assets</span> page — this table only
            covers demo/seed data, since removing a live host isn't something the
            dashboard should do on its own.
          </p>
        </Panel>

        <Panel className="xl:col-span-5" title="Available Endpoints" subtitle="Routes currently exposed by the API">
          <div className="space-y-2 text-sm">
            {(health?.endpoints || []).map((ep) => (
              <div
                key={ep}
                className="rounded-lg bg-white/[0.03] px-3 py-2 font-mono text-xs text-cyan-300"
              >
                {ep}
              </div>
            ))}
            {!health && (
              <p className="text-slate-500">Endpoint list unavailable — backend unreachable.</p>
            )}
          </div>

          {health && (
            <div className="mt-4 space-y-2 rounded-xl bg-white/[0.03] p-4 text-sm">
              <Row label="Application" value={health.application} />
              <Row label="Version" value={health.version} accent="text-cyan-300" />
              <Row label="Status" value={health.status} accent="text-emerald-300" />
              <Row label="API base URL" value={API_URL} accent="text-slate-300" />
            </div>
          )}
        </Panel>
      </div>

      <div className="surface-panel-soft mt-4 flex items-start gap-3 rounded-2xl p-5 text-sm text-slate-500">
        <Info size={16} className="mt-0.5 shrink-0 text-slate-400" />
        <p>
          User accounts, notification preferences and role-based access aren't
          implemented yet — this page currently covers live backend
          connectivity, demo data management and system information. The
          light/dark theme control lives in the header, next to the
          notification bell.
        </p>
      </div>
    </>
  );
}

function Row({ label, value, accent = "text-white" }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-slate-400">{label}</span>
      <span className={`truncate font-semibold ${accent}`}>{value}</span>
    </div>
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

function Panel({ title, subtitle, actions, className = "", children }) {
  return (
    <section className={`surface-panel rounded-2xl p-5 ${className}`}>
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <h2 className="font-display text-lg font-semibold text-white">{title}</h2>
          {subtitle && <p className="mt-0.5 text-sm text-slate-500">{subtitle}</p>}
        </div>
        {actions}
      </div>
      {children}
    </section>
  );
}
