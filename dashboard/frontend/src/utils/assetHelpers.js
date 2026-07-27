export function formatRelativeTime(iso) {
  if (!iso) return "—";
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return iso;

  const seconds = Math.floor((Date.now() - then) / 1000);
  if (seconds < 60) return "Just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

export function formatDateTime(iso) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString();
}

export function computePosture(host, openIncidents = []) {
  if (host.status !== "Online") return { label: "Unreachable", tone: "slate" };

  const critical = openIncidents.filter((i) => i.severity === "Critical").length;
  const high = openIncidents.filter((i) => i.severity === "High").length;

  if (critical > 0) return { label: "Critical", tone: "rose" };
  if (high > 0 || openIncidents.length > 0) return { label: "At Risk", tone: "amber" };
  return { label: "Healthy", tone: "emerald" };
}

export const POSTURE_STYLES = {
  rose: "bg-rose-500/20 text-rose-300 border-rose-500/30",
  amber: "bg-amber-500/20 text-amber-300 border-amber-500/30",
  emerald: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
  slate: "bg-slate-500/20 text-slate-300 border-slate-500/30",
};
