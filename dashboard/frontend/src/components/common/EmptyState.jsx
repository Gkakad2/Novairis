export default function EmptyState({ title = "Nothing here yet", message = "" }) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-700 bg-slate-900 p-16 text-center">
      <h3 className="text-xl font-semibold text-slate-300">{title}</h3>
      {message && <p className="mt-2 text-slate-500">{message}</p>}
    </div>
  );
}
