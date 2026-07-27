import { computePosture, formatDateTime, POSTURE_STYLES } from "../../utils/assetHelpers";

export default function AssetSecurityPosture({ host, incidents = [] }) {
  if (!host) return null;

  const posture = computePosture(host, incidents);
  const postureClass = POSTURE_STYLES[posture.tone] || POSTURE_STYLES.slate;

  const bySeverity = {
    Critical: incidents.filter((i) => i.severity === "Critical").length,
    High: incidents.filter((i) => i.severity === "High").length,
    Medium: incidents.filter((i) => i.severity === "Medium").length,
    Low: incidents.filter((i) => i.severity === "Low").length,
  };

  return (
    <div className="surface-panel rounded-2xl p-6">
      <div className="mb-5 flex items-center justify-between">
        <h2 className="font-display text-xl font-semibold">Security posture</h2>
        <span className={`rounded-full border px-3 py-1 text-sm font-semibold ${postureClass}`}>
          {posture.label}
        </span>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Metric label="Open alerts" value={incidents.length} />
        <Metric label="Critical" value={bySeverity.Critical} accent="text-rose-300" />
        <Metric label="High" value={bySeverity.High} accent="text-amber-300" />
        <Metric label="Medium / Low" value={bySeverity.Medium + bySeverity.Low} />
      </div>

      <div className="mt-5">
        <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
          Open exposure
        </p>
        {incidents.length === 0 ? (
          <p className="rounded-xl border border-dashed border-white/10 p-4 text-sm text-slate-500">
            No open incidents on this endpoint.
          </p>
        ) : (
          <div className="space-y-2">
            {incidents.slice(0, 5).map((inc) => (
              <div
                key={inc.id}
                className="flex items-center justify-between rounded-xl border border-white/8 bg-black/20 px-4 py-3"
              >
                <div>
                  <p className="text-sm font-medium">{inc.title}</p>
                  <p className="text-xs text-slate-500">
                    {inc.rule_id} · {inc.category}
                  </p>
                </div>
                <span className="text-xs font-semibold text-amber-300">
                  {inc.severity}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2 text-sm">
        <Info label="First discovered" value={formatDateTime(host.first_seen)} />
        <Info label="Last agent check-in" value={formatDateTime(host.last_seen)} />
        <Info label="Monitoring scope" value="Process, service, port, user drift" />
        <Info label="Response mode" value="Detect & alert" />
      </div>
    </div>
  );
}

function Metric({ label, value, accent = "text-white" }) {
  return (
    <div className="rounded-xl border border-white/8 bg-black/20 p-4">
      <p className="text-xs text-slate-500">{label}</p>
      <p className={`metric-value mt-1 text-2xl font-semibold ${accent}`}>{value}</p>
    </div>
  );
}

function Info({ label, value }) {
  return (
    <div className="rounded-xl border border-white/8 bg-black/20 p-3">
      <p className="text-xs text-slate-500">{label}</p>
      <p className="mt-1 text-slate-200">{value}</p>
    </div>
  );
}
