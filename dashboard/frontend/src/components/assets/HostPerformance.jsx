export default function HostPerformance({ host }) {

  if (!host) return null;

  return (

    <div className="rounded-2xl border border-slate-700 bg-slate-900 p-6">

      <h2 className="mb-6 text-2xl font-bold">
        Resource Utilization
      </h2>

      <div className="space-y-8">

        <div>

          <div className="mb-2 flex items-center justify-between">

            <span className="text-slate-400">
              CPU Usage
            </span>

            <span className="font-semibold">
              {host.cpu}%
            </span>

          </div>

          <div className="h-3 rounded-full bg-slate-800">

            <div
              className={`h-3 rounded-full transition-all duration-500 ${
                host.cpu >= 80
                  ? "bg-red-500"
                  : host.cpu >= 60
                  ? "bg-amber-500"
                  : "bg-cyan-500"
              }`}
              style={{
                width: `${host.cpu}%`,
              }}
            />

          </div>

        </div>

        <div>

          <div className="mb-2 flex items-center justify-between">

            <span className="text-slate-400">
              Memory Usage
            </span>

            <span className="font-semibold">
              {host.memory}%
            </span>

          </div>

          <div className="h-3 rounded-full bg-slate-800">

            <div
              className={`h-3 rounded-full transition-all duration-500 ${
                host.memory >= 80
                  ? "bg-red-500"
                  : host.memory >= 60
                  ? "bg-amber-500"
                  : "bg-emerald-500"
              }`}
              style={{
                width: `${host.memory}%`,
              }}
            />

          </div>

        </div>

      </div>

      <div className="mt-8 grid grid-cols-3 gap-4">

        <div className="rounded-xl bg-slate-800 p-4">

          <p className="text-xs uppercase tracking-wide text-slate-400">
            Processes
          </p>

          <p className="mt-2 text-3xl font-bold text-cyan-400">
            {host.processes}
          </p>

        </div>

        <div className="rounded-xl bg-slate-800 p-4">

          <p className="text-xs uppercase tracking-wide text-slate-400">
            CPU State
          </p>

          <p className="mt-2 font-semibold">

            {host.cpu >= 80
              ? "Critical"
              : host.cpu >= 60
              ? "Warning"
              : "Healthy"}

          </p>

        </div>

        <div className="rounded-xl bg-slate-800 p-4">

          <p className="text-xs uppercase tracking-wide text-slate-400">
            Memory State
          </p>

          <p className="mt-2 font-semibold">

            {host.memory >= 80
              ? "Critical"
              : host.memory >= 60
              ? "Warning"
              : "Healthy"}

          </p>

        </div>

      </div>

    </div>

  );

}
