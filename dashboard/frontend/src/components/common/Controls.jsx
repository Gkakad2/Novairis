export function FilterSelect({ label, value, onChange, options }) {
  return (
    <label className="inline-flex min-w-[150px] items-center gap-2 rounded-xl border border-white/10 bg-black/25 px-3 py-2 text-sm">
      <span className="text-xs uppercase tracking-wider text-slate-500">
        {label}
      </span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="flex-1 bg-transparent font-medium text-slate-200 outline-none"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value} className="bg-slate-900">
            {opt.label}
          </option>
        ))}
      </select>
    </label>
  );
}

export function FilterChip({ active, onClick, children, tone = "cyan" }) {
  const tones = {
    cyan: active
      ? "border-cyan-400/50 bg-cyan-400/15 text-cyan-200 shadow-[0_0_20px_rgba(34,211,238,0.12)]"
      : "border-white/10 bg-white/[0.03] text-slate-400 hover:border-white/20 hover:text-slate-200",
    rose: active
      ? "border-rose-400/50 bg-rose-400/15 text-rose-200"
      : "border-white/10 bg-white/[0.03] text-slate-400 hover:border-white/20",
    amber: active
      ? "border-amber-400/50 bg-amber-400/15 text-amber-200"
      : "border-white/10 bg-white/[0.03] text-slate-400 hover:border-white/20",
  };

  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full border px-3.5 py-1.5 text-sm font-medium transition ${tones[tone] || tones.cyan}`}
    >
      {children}
    </button>
  );
}

export function SortSelect({ value, onChange, options, label = "Sort" }) {
  return (
    <label className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/25 px-3 py-1.5 text-sm">
      <span className="text-xs uppercase tracking-wider text-slate-500">
        {label}
      </span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="bg-transparent font-medium text-slate-200 outline-none"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value} className="bg-slate-900">
            {opt.label}
          </option>
        ))}
      </select>
    </label>
  );
}

export function HostSelect({ value, onChange, hosts = [], allLabel = "All Hosts" }) {
  return (
    <label className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/25 px-3 py-1.5 text-sm">
      <span className="text-xs uppercase tracking-wider text-slate-500">Host</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="max-w-[180px] bg-transparent font-medium text-slate-200 outline-none"
      >
        <option value="All" className="bg-slate-900">
          {allLabel}
        </option>
        {hosts.map((h) => {
          const name = typeof h === "string" ? h : h.hostname;
          return (
            <option key={name} value={name} className="bg-slate-900">
              {name}
            </option>
          );
        })}
      </select>
    </label>
  );
}

export function PageHero({ title, subtitle, actions }) {
  return (
    <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
      <div>
        <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.28em] text-cyan-400/80">
          Novairis
        </p>
        <h1 className="font-display text-4xl font-semibold tracking-tight text-white md:text-[2.6rem]">
          {title}
        </h1>
        {subtitle && (
          <p className="mt-2 max-w-2xl text-[15px] leading-relaxed text-slate-400">
            {subtitle}
          </p>
        )}
      </div>
      {actions}
    </div>
  );
}

export function ControlBar({ children }) {
  return (
    <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/8 bg-gradient-to-r from-white/[0.04] to-transparent px-4 py-3 backdrop-blur-sm">
      {children}
    </div>
  );
}
