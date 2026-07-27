import { useEffect, useMemo, useState } from "react";

import { getHostResources } from "../../services/dashboardService";

function matchesQuery(host, query) {
  if (!query) return true;
  const q = query.toLowerCase();
  return (
    (host.hostname || "").toLowerCase().includes(q) ||
    (host.ip || "").toLowerCase().includes(q) ||
    (host.os || "").toLowerCase().includes(q)
  );
}

export default function HostResourceInventory({
  searchQuery = "",
  refreshToken = 0,
}) {
  const [hosts, setHosts] = useState([]);

  async function loadInventory() {
    try {
      const data = await getHostResources();
      setHosts(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    }
  }

  useEffect(() => {
    loadInventory();
  }, [refreshToken]);

  const filteredHosts = useMemo(
    () => hosts.filter((host) => matchesQuery(host, searchQuery.trim())),
    [hosts, searchQuery]
  );

  return (
    <div className="surface-panel rounded-2xl p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="font-display text-2xl font-semibold text-white">
            Host Resource Inventory
          </h2>
          {searchQuery.trim() && (
            <p className="mt-1 text-sm text-slate-500">
              {filteredHosts.length} of {hosts.length} hosts match your search
            </p>
          )}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr className="border-b border-white/10 text-sm uppercase tracking-wider text-slate-400">
              <th className="px-4 py-4 text-left">Host</th>
              <th className="px-4 py-4 text-left">IP Address</th>
              <th className="px-4 py-4 text-left">OS</th>
              <th className="px-4 py-4 text-center">CPU %</th>
              <th className="px-4 py-4 text-center">Memory %</th>
              <th className="px-4 py-4 text-center">Status</th>
            </tr>
          </thead>

          <tbody>
            {filteredHosts.length === 0 ? (
              <tr>
                <td colSpan="6" className="py-10 text-center text-slate-500">
                  {searchQuery.trim()
                    ? `No hosts match "${searchQuery.trim()}".`
                    : "No hosts available"}
                </td>
              </tr>
            ) : (
              filteredHosts.map((host) => {
                const cpu = Number(host.cpu ?? 0);
                const memory = Number(host.memory ?? 0);
                const os = (host.os || "").toLowerCase();
                const icon = os.includes("windows")
                  ? "🪟"
                  : os.includes("linux")
                  ? "🐧"
                  : "💻";
                const online = host.status === "Online";

                return (
                  <tr
                    key={host.hostname}
                    className="border-b border-white/[0.04] transition hover:bg-white/[0.03]"
                  >
                    <td className="px-4 py-5">
                      <div className="flex items-center gap-3">
                        <span className="text-xl">🖥</span>
                        <span className="font-medium text-white">
                          {host.hostname || "-"}
                        </span>
                      </div>
                    </td>

                    <td className="px-4 py-5 font-mono text-slate-300">
                      {host.ip || "-"}
                    </td>

                    <td className="px-4 py-5">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{icon}</span>
                        <span className="text-slate-300">
                          {host.os || "Unknown"}
                        </span>
                      </div>
                    </td>

                    <td className="px-4 py-5">
                      <div className="flex items-center gap-3">
                        <div className="h-2 flex-1 rounded-full bg-slate-700">
                          <div
                            className={`h-2 rounded-full transition-all duration-500 ${
                              cpu >= 80
                                ? "bg-red-500"
                                : cpu >= 60
                                ? "bg-amber-500"
                                : "bg-cyan-500"
                            }`}
                            style={{ width: `${Math.min(cpu, 100)}%` }}
                          />
                        </div>
                        <span className="w-14 text-right text-sm font-semibold text-white">
                          {cpu.toFixed(1)}%
                        </span>
                      </div>
                    </td>

                    <td className="px-4 py-5">
                      <div className="flex items-center gap-3">
                        <div className="h-2 flex-1 rounded-full bg-slate-700">
                          <div
                            className={`h-2 rounded-full transition-all duration-500 ${
                              memory >= 80
                                ? "bg-red-500"
                                : memory >= 60
                                ? "bg-amber-500"
                                : "bg-emerald-500"
                            }`}
                            style={{ width: `${Math.min(memory, 100)}%` }}
                          />
                        </div>
                        <span className="w-14 text-right text-sm font-semibold text-white">
                          {memory.toFixed(1)}%
                        </span>
                      </div>
                    </td>

                    <td className="px-4 py-5 text-center">
                      <span
                        className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${
                          online
                            ? "bg-green-500/20 text-green-400"
                            : "bg-red-500/20 text-red-400"
                        }`}
                      >
                        {online ? "Online" : "Offline"}
                      </span>
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
