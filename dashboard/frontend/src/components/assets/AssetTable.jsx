import {
  formatDateTime,
  formatRelativeTime,
  POSTURE_STYLES,
} from "../../utils/assetHelpers";

export default function AssetTable({
  assets,
  selectedHost,
  setSelectedHost,
}) {
  return (
    <div className="surface-panel overflow-hidden rounded-2xl">
      <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
        <div>
          <h2 className="font-display text-xl font-semibold">Endpoint inventory</h2>
          <p className="mt-1 text-sm text-slate-500">
            {assets.length} endpoint{assets.length === 1 ? "" : "s"} in view
          </p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[900px]">
          <thead className="border-b border-white/10 bg-black/20">
            <tr className="text-left text-xs uppercase tracking-wider text-slate-500">
              <th className="p-4">Hostname</th>
              <th className="p-4">IP address</th>
              <th className="p-4">Platform</th>
              <th className="p-4">Agent</th>
              <th className="p-4">Processes</th>
              <th className="p-4">Open alerts</th>
              <th className="p-4">Posture</th>
              <th className="p-4">Last seen</th>
            </tr>
          </thead>

          <tbody>
            {assets.length === 0 ? (
              <tr>
                <td colSpan="8" className="p-10 text-center text-slate-500">
                  No assets match the current filters.
                </td>
              </tr>
            ) : (
              assets.map((host) => {
                const selected = selectedHost?.hostname === host.hostname;
                const postureClass =
                  POSTURE_STYLES[host.posture_tone] || POSTURE_STYLES.slate;

                return (
                  <tr
                    key={host.hostname}
                    onClick={() =>
                      setSelectedHost(selected ? null : host)
                    }
                    className={`cursor-pointer border-b border-white/[0.04] transition hover:bg-white/[0.03] ${
                      selected ? "bg-cyan-400/5" : ""
                    }`}
                  >
                    <td className="p-4 font-semibold text-white">
                      {host.hostname}
                    </td>
                    <td className="p-4 font-mono text-sm text-slate-300">
                      {host.ip}
                    </td>
                    <td className="p-4">
                      <p className="text-sm text-slate-200">{host.os}</p>
                      <p className="text-xs text-slate-500">{host.kernel}</p>
                    </td>
                    <td className="p-4">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          host.status === "Online"
                            ? "bg-emerald-500/20 text-emerald-300"
                            : "bg-rose-500/20 text-rose-300"
                        }`}
                      >
                        {host.status === "Online" ? "Connected" : "Stale"}
                      </span>
                    </td>
                    <td className="p-4 text-slate-300">{host.processes ?? 0}</td>
                    <td className="p-4">
                      {host.open_alerts > 0 ? (
                        <span className="rounded-full bg-amber-500/20 px-2.5 py-1 text-xs font-semibold text-amber-300">
                          {host.open_alerts}
                        </span>
                      ) : (
                        <span className="text-slate-500">0</span>
                      )}
                    </td>
                    <td className="p-4">
                      <span
                        className={`rounded-full border px-3 py-1 text-xs font-semibold ${postureClass}`}
                      >
                        {host.posture}
                      </span>
                    </td>
                    <td className="p-4 text-sm text-slate-400">
                      <p>{formatRelativeTime(host.last_seen)}</p>
                      <p className="text-xs text-slate-600">
                        {formatDateTime(host.last_seen)}
                      </p>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
