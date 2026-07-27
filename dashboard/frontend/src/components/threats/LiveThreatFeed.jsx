import { useEffect, useMemo, useState } from "react";

import { getThreatFeed } from "../../services/dashboardService";

function matchesQuery(threat, query) {
  if (!query) return true;
  const q = query.toLowerCase();
  return (
    (threat.hostname || "").toLowerCase().includes(q) ||
    (threat.title || "").toLowerCase().includes(q) ||
    (threat.rule_id || "").toLowerCase().includes(q) ||
    (threat.severity || "").toLowerCase().includes(q)
  );
}

export default function LiveThreatFeed({ searchQuery = "", refreshToken = 0 }) {
  const [threats, setThreats] = useState([]);

  async function loadThreats() {
    try {
      const data = await getThreatFeed();
      setThreats(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    }
  }

  useEffect(() => {
    loadThreats();
  }, [refreshToken]);

  const filtered = useMemo(
    () => threats.filter((t) => matchesQuery(t, searchQuery.trim())),
    [threats, searchQuery]
  );

  function severityStyle(severity) {
    switch ((severity || "").toLowerCase()) {
      case "critical":
        return {
          color: "border-red-500/40 bg-red-500/10",
          badge: "bg-red-500/20 text-red-400",
        };
      case "high":
        return {
          color: "border-orange-500/40 bg-orange-500/10",
          badge: "bg-orange-500/20 text-orange-400",
        };
      case "medium":
        return {
          color: "border-yellow-500/40 bg-yellow-500/10",
          badge: "bg-yellow-500/20 text-yellow-400",
        };
      default:
        return {
          color: "border-cyan-500/40 bg-cyan-500/10",
          badge: "bg-cyan-500/20 text-cyan-400",
        };
    }
  }

  return (
    <div className="surface-panel h-full rounded-2xl p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="font-display text-2xl font-semibold text-white">
            Live Threat Feed
          </h2>
          {searchQuery.trim() && (
            <p className="mt-1 text-sm text-slate-500">
              {filtered.length} alert{filtered.length === 1 ? "" : "s"} match your search
            </p>
          )}
        </div>
        <span className="rounded-lg bg-red-500/20 px-3 py-1 text-sm font-semibold text-red-400">
          LIVE
        </span>
      </div>

      <div className="max-h-[540px] space-y-4 overflow-y-auto pr-1">
        {filtered.length === 0 ? (
          <div className="rounded-xl border border-white/10 bg-black/20 p-8 text-center text-slate-400">
            {searchQuery.trim()
              ? `No alerts match "${searchQuery.trim()}".`
              : "No active threats"}
          </div>
        ) : (
          filtered.map((threat) => {
            const style = severityStyle(threat.severity);

            return (
              <div
                key={threat.id}
                className={`rounded-xl border p-4 transition hover:scale-[1.01] ${style.color}`}
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`rounded-lg px-3 py-1 text-xs font-bold uppercase ${style.badge}`}
                  >
                    {threat.severity}
                  </span>
                  <span className="text-xs text-slate-400">
                    {threat.time
                      ? new Date(threat.time).toLocaleTimeString()
                      : "-"}
                  </span>
                </div>

                <h3 className="mt-3 text-lg font-semibold text-white">
                  {threat.title}
                </h3>

                <div className="mt-4 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Host</span>
                    <span className="font-medium text-white">
                      {threat.hostname}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Rule</span>
                    <span className="font-medium text-cyan-400">
                      {threat.rule_id}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Status</span>
                    <span className="font-medium text-emerald-400">
                      {threat.status}
                    </span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
