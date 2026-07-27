export default function QuickActions({ host, setPage }) {
  if (!host) return null;

  const actions = [
    {
      label: "View open incidents",
      hint: "Jump to incident queue filtered for this host",
      onClick: () => setPage?.("incidents"),
      enabled: true,
    },
    {
      label: "Threat intelligence",
      hint: "Fleet-wide technique and severity context",
      onClick: () => setPage?.("threatintel"),
      enabled: true,
    },
    {
      label: "Host analytics",
      hint: "Timeline and drift trends for this endpoint",
      onClick: () => setPage?.("analytics"),
      enabled: true,
    },
    {
      label: "Export asset record",
      hint: "Download JSON snapshot of this endpoint",
      onClick: () => {
        const blob = new Blob([JSON.stringify(host, null, 2)], {
          type: "application/json",
        });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `novairis-${host.hostname}.json`;
        link.click();
        URL.revokeObjectURL(url);
      },
      enabled: true,
    },
    {
      label: "Isolate endpoint",
      hint: "Network containment",
      enabled: false,
    },
    {
      label: "Run live response",
      hint: "Remote shell and remediation",
      enabled: false,
    },
  ];

  return (
    <div className="surface-panel rounded-2xl p-6">
      <h2 className="mb-5 font-display text-lg font-semibold">Response actions</h2>

      <div className="space-y-3">
        {actions.map((action) => (
          <button
            key={action.label}
            type="button"
            disabled={!action.enabled}
            onClick={action.onClick}
            className={`flex w-full items-start justify-between rounded-xl border px-4 py-3 text-left transition ${
              action.enabled
                ? "border-white/10 bg-black/20 hover:border-cyan-400/30 hover:bg-black/30"
                : "cursor-not-allowed border-white/5 bg-black/10 text-slate-500"
            }`}
          >
            <div>
              <p className="text-sm font-medium">{action.label}</p>
              <p className="mt-0.5 text-xs text-slate-500">{action.hint}</p>
            </div>
            <span className="text-xs text-slate-500">
              {action.enabled ? "→" : "Soon"}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
