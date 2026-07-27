export default function SecurityHealth() {
  const score = 98;

  return (
    <div className="rounded-2xl border border-slate-700 bg-slate-900 p-6 h-[420px]">

      <div className="flex items-center justify-between">

        <div>
          <h2 className="text-2xl font-bold text-white">
            Security Health
          </h2>

          <p className="text-sm text-slate-400">
            Overall security posture
          </p>
        </div>

        <div className="rounded-lg bg-emerald-500/10 px-3 py-1">
          <span className="text-sm font-semibold text-emerald-400">
            Excellent
          </span>
        </div>

      </div>

      <div className="mt-8 flex flex-col items-center">

        <div className="relative">

          <svg width="220" height="220">

            <circle
              cx="110"
              cy="110"
              r="90"
              stroke="#1e293b"
              strokeWidth="16"
              fill="none"
            />

            <circle
              cx="110"
              cy="110"
              r="90"
              stroke="#22c55e"
              strokeWidth="16"
              fill="none"
              strokeDasharray={565}
              strokeDashoffset={565 - (565 * score) / 100}
              strokeLinecap="round"
              transform="rotate(-90 110 110)"
            />

          </svg>

          <div className="absolute inset-0 flex flex-col items-center justify-center">

            <h1 className="text-6xl font-extrabold text-emerald-400">
              {score}%
            </h1>

            <p className="mt-2 text-slate-300">
              Healthy
            </p>

          </div>

        </div>

      </div>

      <div className="mt-8">

        <div className="mb-2 flex justify-between text-sm text-slate-400">
          <span>Protection Coverage</span>
          <span>98%</span>
        </div>

        <div className="h-3 overflow-hidden rounded-full bg-slate-800">

          <div
            className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-green-400"
            style={{ width: "98%" }}
          />

        </div>

      </div>

    </div>
  );
}
