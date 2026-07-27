import clsx from "clsx";

export default function Card({
  children,
  className = "",
}) {
  return (
    <div
      className={clsx(
        "rounded-2xl",
        "border",
        "border-slate-700/60",
        "bg-slate-900/70",
        "backdrop-blur-md",
        "shadow-2xl",
        "transition-all",
        "duration-300",
        "hover:border-cyan-500/40",
        "hover:shadow-cyan-500/10",
        className
      )}
    >
      {children}
    </div>
  );
}
