import { useEffect, useState } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
} from "recharts";

import { getTopMitre } from "../../services/threatIntel";

export default function TopMitreTechniques({ refreshToken = 0 }) {
  const [data, setData] = useState([]);

  async function loadMitre() {
    try {
      const result = await getTopMitre();
      setData(Array.isArray(result) ? result : []);
    } catch (err) {
      console.error(err);
    }
  }

  useEffect(() => {
    loadMitre();
  }, [refreshToken]);

  const colors = ["#ef4444", "#f97316", "#eab308", "#06b6d4", "#8b5cf6"];

  return (
    <div className="surface-panel rounded-2xl p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="font-display text-xl font-semibold text-white">
            Top MITRE Techniques
          </h2>
          <p className="mt-1 text-xs text-slate-500">
            Mapped from open incidents and drift categories
          </p>
        </div>
        <span className="rounded-lg bg-cyan-500/20 px-3 py-1 text-xs font-semibold text-cyan-400">
          LIVE
        </span>
      </div>

      {data.length === 0 ? (
        <div className="flex h-48 items-center justify-center text-slate-400">
          No technique data yet
        </div>
      ) : (
        <>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={data}
                layout="vertical"
                margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
              >
                <XAxis type="number" stroke="#94a3b8" allowDecimals={false} />
                <YAxis
                  type="category"
                  dataKey="mitre"
                  stroke="#94a3b8"
                  width={88}
                  tick={{ fontSize: 11 }}
                />
                <Tooltip
                  contentStyle={{
                    background: "#0f172a",
                    border: "1px solid #334155",
                    borderRadius: "10px",
                    color: "#fff",
                  }}
                />
                <Bar dataKey="count" radius={[0, 8, 8, 0]}>
                  {data.map((entry, index) => (
                    <Cell
                      key={entry.mitre}
                      fill={colors[index % colors.length]}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-4 space-y-2">
            {data.map((item) => (
              <div
                key={item.mitre}
                className="flex items-center justify-between rounded-lg border border-white/8 bg-black/20 px-4 py-2"
              >
                <div>
                  <span className="font-semibold text-cyan-300">{item.mitre}</span>
                  {item.label && (
                    <p className="text-xs text-slate-500">{item.label}</p>
                  )}
                </div>
                <span className="font-bold text-white">{item.count}</span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
