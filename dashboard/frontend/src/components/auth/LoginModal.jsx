import { useState } from "react";
import { Lock, LogIn, X } from "lucide-react";

import { useAuth } from "../../contexts/AuthContext";

export default function LoginModal({ open, onClose }) {
  const { login, demoCredentials } = useAuth();
  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (!open) return null;

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      login(username, password);
      onClose();
    } catch (err) {
      setError(err.message || "Login failed.");
    } finally {
      setSubmitting(false);
    }
  }

  function useDemo(user) {
    setUsername(user.username);
    setPassword(user.password);
    setError("");
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="surface-panel w-full max-w-md rounded-2xl p-6">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h2 className="font-display text-xl font-semibold">Sign in</h2>
            <p className="mt-1 text-sm text-slate-400">
              Use your Novairis credentials to access the console.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-white/10 p-2 text-slate-400 hover:text-white"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="block">
            <span className="text-sm text-slate-400">Username</span>
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="mt-1.5 w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 outline-none focus:border-cyan-400/50"
              autoComplete="username"
            />
          </label>

          <label className="block">
            <span className="text-sm text-slate-400">Password</span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1.5 w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 outline-none focus:border-cyan-400/50"
              autoComplete="current-password"
            />
          </label>

          {error && (
            <p className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-300">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-cyan-600 py-3 font-semibold hover:bg-cyan-500 disabled:opacity-50"
          >
            <LogIn size={16} />
            {submitting ? "Signing in..." : "Sign in"}
          </button>
        </form>

        <div className="mt-6 rounded-xl border border-dashed border-white/10 p-4">
          <p className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
            <Lock size={12} /> Demo credentials
          </p>
          <div className="space-y-2">
            {demoCredentials.map((cred) => (
              <button
                key={cred.username}
                type="button"
                onClick={() => useDemo(cred)}
                className="flex w-full items-center justify-between rounded-lg border border-white/8 bg-black/20 px-3 py-2 text-left text-sm hover:border-cyan-400/30"
              >
                <span>
                  <span className="font-medium text-white">{cred.name}</span>
                  <span className="ml-2 text-slate-500">({cred.username})</span>
                </span>
                <span className="font-mono text-xs text-cyan-300">
                  {cred.password}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
