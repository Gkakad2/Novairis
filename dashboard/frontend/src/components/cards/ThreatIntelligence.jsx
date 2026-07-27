import { useEffect, useState } from "react";

import { getThreatIntelligence } from "../../services/threatIntel";

export default function ThreatIntelligence({ refreshToken = 0 }) {
  const [data, setData] = useState({
    critical: 0,
    high: 0,
    medium: 0,
    low: 0,
    hosts: 0,
    mitre: 0,
    score: "LOW",
  });

  async function loadData() {
    try {
      const result = await getThreatIntelligence();
      setData(result);
    } catch (err) {
      console.error(err);
    }
  }

  useEffect(() => {
    loadData();
  }, [refreshToken]);

  const scoreColor = {
    LOW: "text-green-400",
    MEDIUM: "text-yellow-400",
    HIGH: "text-orange-400",
    CRITICAL: "text-red-400",
  };

  return (
    <div className="surface-panel rounded-2xl p-6">
      <h2 className="mb-6 font-display text-xl font-semibold">
        Threat Intelligence
      </h2>

      <div className="space-y-4">
        <div className="flex justify-between">
          <span className="text-slate-400">Critical Alerts</span>
          <span className="font-bold text-red-400">{data.critical}</span>
        </div>

        <div className="flex justify-between">
          <span className="text-slate-400">High Alerts</span>
          <span className="font-bold text-orange-400">{data.high}</span>
        </div>

        <div className="flex justify-between">
          <span className="text-slate-400">Medium Alerts</span>
          <span className="font-bold text-yellow-400">{data.medium}</span>
        </div>

        <div className="flex justify-between">
          <span className="text-slate-400">Low Alerts</span>
          <span className="font-bold text-cyan-400">{data.low}</span>
        </div>

        <hr className="border-white/10" />

        <div className="flex justify-between">
          <span className="text-slate-400">MITRE Techniques</span>
          <span className="font-bold">{data.mitre}</span>
        </div>

        <div className="flex justify-between">
          <span className="text-slate-400">Affected Hosts</span>
          <span className="font-bold">{data.hosts}</span>
        </div>

        <hr className="border-white/10" />

        <div>
          <p className="text-sm uppercase tracking-wider text-slate-400">
            Threat Score
          </p>
          <h1
            className={`metric-value mt-2 text-5xl font-extrabold ${
              scoreColor[data.score] || scoreColor.LOW
            }`}
          >
            {data.score}
          </h1>
        </div>
      </div>
    </div>
  );
}
