export default function FleetSummary({

  totalHosts,
  onlineHosts,
  offlineHosts,
  linuxHosts,
  windowsHosts,
  averageCPU,
  averageMemory,

}) {

  return (

    <div className="mb-8 grid grid-cols-6 gap-4">

      <div className="rounded-xl border border-slate-700 bg-slate-900 p-5">

        <p className="text-sm text-slate-400">
          Total Hosts
        </p>

        <p className="mt-2 text-3xl font-bold">
          {totalHosts}
        </p>

      </div>

      <div className="rounded-xl border border-slate-700 bg-slate-900 p-5">

        <p className="text-sm text-slate-400">
          Online
        </p>

        <p className="mt-2 text-3xl font-bold text-emerald-400">
          {onlineHosts}
        </p>

      </div>

      <div className="rounded-xl border border-slate-700 bg-slate-900 p-5">

        <p className="text-sm text-slate-400">
          Offline
        </p>

        <p className="mt-2 text-3xl font-bold text-red-400">
          {offlineHosts}
        </p>

      </div>

      <div className="rounded-xl border border-slate-700 bg-slate-900 p-5">

        <p className="text-sm text-slate-400">
          Linux / Windows
        </p>

        <p className="mt-2 text-xl font-bold">

          <span className="text-cyan-400">
            {linuxHosts}
          </span>

          <span className="mx-2 text-slate-500">
            /
          </span>

          <span className="text-blue-400">
            {windowsHosts}
          </span>

        </p>

      </div>

      <div className="rounded-xl border border-slate-700 bg-slate-900 p-5">

        <p className="text-sm text-slate-400">
          Average CPU
        </p>

        <p className="mt-2 text-3xl font-bold text-cyan-400">
          {averageCPU}%
        </p>

      </div>

      <div className="rounded-xl border border-slate-700 bg-slate-900 p-5">

        <p className="text-sm text-slate-400">
          Average Memory
        </p>

        <p className="mt-2 text-3xl font-bold text-emerald-400">
          {averageMemory}%
        </p>

      </div>

    </div>

  );

}
