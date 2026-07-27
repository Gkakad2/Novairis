import {
  LayoutDashboard,
  Server,
  ShieldAlert,
  Radar,
  BarChart3,
  FileText,
  Settings,
  ChevronRight,
} from "lucide-react";

const menu = [
  {
    name: "Dashboard",
    page: "dashboard",
    icon: LayoutDashboard,
  },
  {
    name: "Assets",
    page: "assets",
    icon: Server,
  },
  {
    name: "Incidents",
    page: "incidents",
    icon: ShieldAlert,
  },
  {
    name: "Threat Intel",
    page: "threatintel",
    icon: Radar,
  },
  {
    name: "Analytics",
    page: "analytics",
    icon: BarChart3,
  },
  {
    name: "Reports",
    page: "reports",
    icon: FileText,
  },
  {
    name: "Settings",
    page: "settings",
    icon: Settings,
  },
];

export default function Sidebar({ page, setPage }) {
  return (
    <aside className="flex h-screen w-72 flex-col border-r border-white/8 bg-[#07111D]/90 backdrop-blur-xl">

      {/* Logo */}
      <div className="border-b border-white/8 px-7 py-7">

        <div className="flex items-center gap-4">

          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-400 to-teal-500 font-display text-lg font-bold text-slate-950 shadow-lg shadow-cyan-500/20">
            N
          </div>

          <div>

            <h1 className="font-display text-xl font-semibold tracking-wide text-white">
              NOVAIRIS
            </h1>

            <p className="text-xs text-slate-500">
              Security Intelligence
            </p>

          </div>

        </div>

      </div>

      {/* Navigation */}
      <div className="flex-1 px-5 py-6">

        <p className="mb-4 px-3 text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">
          Navigation
        </p>

        <nav className="space-y-2">

          {menu.map((item) => {

            const Icon = item.icon;
            const active = page === item.page;

            return (

              <button
                key={item.name}
                onClick={() => setPage(item.page)}
                className={`group flex w-full items-center justify-between rounded-2xl px-3 py-3 transition-all duration-300 ${
                  active
                    ? "border border-cyan-500/30 bg-cyan-500/10 shadow-lg shadow-cyan-500/10"
                    : "hover:bg-slate-800/70"
                }`}
              >

                <div className="flex items-center gap-4">

                  <div
                    className={`rounded-xl p-2 ${
                      active
                        ? "bg-cyan-500/20"
                        : "bg-slate-800 group-hover:bg-slate-700"
                    }`}
                  >

                    <Icon
                      size={18}
                      className={
                        active
                          ? "text-cyan-400"
                          : "text-slate-300"
                      }
                    />

                  </div>

                  <span
                    className={
                      active
                        ? "font-medium text-cyan-300"
                        : "font-medium text-slate-300"
                    }
                  >
                    {item.name}
                  </span>

                </div>

                {active && (
                  <ChevronRight
                    size={18}
                    className="text-cyan-400"
                  />
                )}

              </button>

            );
          })}

        </nav>

      </div>

      {/* Bottom Status */}
      <div className="border-t border-slate-800 p-5">

        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">

          <p className="text-xs uppercase tracking-[0.25em] text-slate-500">
            System Status
          </p>

          <div className="mt-5 flex items-center gap-3">

            <div className="h-3 w-3 rounded-full bg-emerald-400 animate-pulse" />

            <div>

              <p className="font-medium text-white">
                Connected
              </p>

              <p className="text-xs text-slate-400">
                Backend Online
              </p>

            </div>

          </div>

          <div className="mt-5 rounded-xl bg-slate-800 p-3">

            <div className="flex items-center justify-between">

              <span className="text-sm text-slate-400">
                Version
              </span>

              <span className="font-semibold text-cyan-400">
                v1.0.0
              </span>

            </div>

          </div>

        </div>

      </div>

    </aside>
  );
}
