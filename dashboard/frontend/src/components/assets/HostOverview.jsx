import { formatDateTime } from "../../utils/assetHelpers";

export default function HostOverview({ host }) {
  if (!host) {
    return (
      <div className="surface-panel-soft rounded-2xl border-dashed p-12 text-center">
        <h2 className="font-display text-2xl font-semibold">No host selected</h2>
        <p className="mt-3 text-slate-400">
          Select an endpoint from the inventory table.
        </p>
      </div>
    );
  }

  return (
    <div className="surface-panel rounded-2xl p-6">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="font-display text-xl font-semibold">Asset identity</h2>
        <span
          className={`rounded-full px-4 py-2 text-sm font-semibold ${
            host.status === "Online"
              ? "bg-emerald-500/20 text-emerald-300"
              : "bg-rose-500/20 text-rose-300"
          }`}
        >
          {host.status === "Online" ? "Agent connected" : "Agent stale"}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <Field label="Hostname" value={host.hostname} />
        <Field label="IP address" value={host.ip} mono />
        <Field label="Operating system" value={host.os} />
        <Field label="Kernel" value={host.kernel} />
        <Field label="First discovered" value={formatDateTime(host.first_seen)} />
        <Field label="Last check-in" value={formatDateTime(host.last_seen)} />
        <Field label="Process inventory" value={String(host.processes ?? 0)} />
        <Field label="Open alerts" value={String(host.open_alerts ?? 0)} />
      </div>
    </div>
  );
}

function Field({ label, value, mono = false }) {
  return (
    <div>
      <p className="text-sm text-slate-500">{label}</p>
      <p className={`mt-2 text-lg font-medium ${mono ? "font-mono text-base" : ""}`}>
        {value || "—"}
      </p>
    </div>
  );
}
