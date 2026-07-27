export default function Pagination({
  page,
  pageSize,
  total,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [10, 25, 50, 100],
}) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(page, totalPages);
  const start = total === 0 ? 0 : (safePage - 1) * pageSize + 1;
  const end = Math.min(safePage * pageSize, total);

  const pages = buildPageList(safePage, totalPages);

  return (
    <div className="flex flex-wrap items-center justify-between gap-4 border-t border-white/8 px-4 py-3">
      <div className="flex flex-wrap items-center gap-3 text-sm text-slate-400">
        <label className="inline-flex items-center gap-2">
          <span className="text-xs uppercase tracking-wider text-slate-500">
            Rows
          </span>
          <select
            value={pageSize}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
            className="rounded-lg border border-white/10 bg-black/25 px-2 py-1.5 text-sm text-slate-200 outline-none"
          >
            {pageSizeOptions.map((n) => (
              <option key={n} value={n} className="bg-slate-900">
                {n}
              </option>
            ))}
          </select>
        </label>
        <span>
          {total === 0
            ? "No entries"
            : `Showing ${start}–${end} of ${total}`}
        </span>
      </div>

      <div className="flex items-center gap-1">
        <PageBtn
          disabled={safePage <= 1}
          onClick={() => onPageChange(safePage - 1)}
        >
          Prev
        </PageBtn>

        {pages.map((p, idx) =>
          p === "…" ? (
            <span key={`gap-${idx}`} className="px-2 text-slate-600">
              …
            </span>
          ) : (
            <PageBtn
              key={p}
              active={p === safePage}
              onClick={() => onPageChange(p)}
            >
              {p}
            </PageBtn>
          )
        )}

        <PageBtn
          disabled={safePage >= totalPages}
          onClick={() => onPageChange(safePage + 1)}
        >
          Next
        </PageBtn>
      </div>
    </div>
  );
}

function PageBtn({ children, onClick, disabled, active }) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={`min-w-[36px] rounded-lg px-3 py-1.5 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-40 ${
        active
          ? "bg-cyan-500/20 text-cyan-300"
          : "text-slate-400 hover:bg-white/5 hover:text-white"
      }`}
    >
      {children}
    </button>
  );
}

function buildPageList(current, total) {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  const pages = [1];
  if (current > 3) pages.push("…");
  for (
    let p = Math.max(2, current - 1);
    p <= Math.min(total - 1, current + 1);
    p += 1
  ) {
    pages.push(p);
  }
  if (current < total - 2) pages.push("…");
  pages.push(total);
  return pages;
}
