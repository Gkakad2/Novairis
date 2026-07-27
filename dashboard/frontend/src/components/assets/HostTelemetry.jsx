import { formatDateTime } from "../../utils/assetHelpers";

export default function HostTelemetry({ host }) {
  if (!host) return null;

  const agentHealthy = host.status === "Online";

  return (
    <div className="space-y-5">
      <div className="surface-panel rounded-2xl p-6">
        <h2 className="mb-5 font-display text-lg font-semibold">Agent coverage</h2>

        <div className="space-y-3">
          <CoverageRow label="Heartbeat" active={agentHealthy} />
          <CoverageRow label="Process inventory" active={agentHealthy} />
          <CoverageRow label="Service inventory" active={agentHealthy} />
          <CoverageRow label="Port inventory" active={agentHealthy} />
          <CoverageRow label="User account drift" active={agentHealthy} />
          <CoverageRow label="File integrity" upcoming />
          <CoverageRow label="Network telemetry" upcoming />
        </div>
      </div>

      <div className="surface-panel rounded-2xl p-6">
        <h2 className="mb-5 font-display text-lg font-semibold">Agent status</h2>

        <div className="space-y-4">
          <div className="rounded-xl bg-black/20 p-4">
            <p className="text-xs uppercase tracking-wide text-slate-500">
              Connection
            </p>
            <p
              className={`mt-2 font-semibold ${
                agentHealthy ? "text-emerald-300" : "text-rose-300"
              }`}
            >
              {agentHealthy ? "Agent connected" : "Agent unreachable"}
            </p>
          </div>

          <div className="rounded-xl bg-black/20 p-4">
            <p className="text-xs uppercase tracking-wide text-slate-500">
              Collection interval
            </p>
            <p className="mt-2 font-semibold text-cyan-300">Every 10 seconds</p>
          </div>

          <div className="rounded-xl bg-black/20 p-4">
            <p className="text-xs uppercase tracking-wide text-slate-500">
              Last check-in
            </p>
            <p className="mt-2 text-sm text-slate-300">
              {formatDateTime(host.last_seen)}
            </p>
          </div>

          <div className="rounded-xl bg-black/20 p-4">
            <p className="text-xs uppercase tracking-wide text-slate-500">
              Process inventory size
            </p>
            <p className="mt-2 text-2xl font-semibold text-white">
              {host.processes ?? 0}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function CoverageRow({ label, active, upcoming }) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-white/8 bg-black/15 px-4 py-2.5">
      <span className="text-sm text-slate-300">{label}</span>
      {upcoming ? (
        <span className="text-xs text-slate-500">Planned</span>
      ) : (
        <span className={active ? "text-emerald-400" : "text-rose-400"}>
          {active ? "Active" : "Inactive"}
        </span>
      )}
    </div>
  );
}
