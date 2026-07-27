import { useState } from "react";
import { X } from "lucide-react";

import { createDemoHost } from "../../services/hosts";

export default function AddHostModal({ onClose, onCreated }) {
  const [form, setForm] = useState({ hostname: "", ip: "", os: "" });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);

    if (!form.hostname.trim()) {
      setError("Hostname is required.");
      return;
    }

    setSubmitting(true);
    try {
      const host = await createDemoHost({
        hostname: form.hostname.trim(),
        ip: form.ip.trim(),
        os: form.os.trim(),
      });
      onCreated?.(host);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="surface-panel w-full max-w-md rounded-2xl p-6"
      >
        <div className="mb-4 flex items-start justify-between">
          <div>
            <h2 className="font-display text-lg font-semibold text-white">
              Add Host
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Creates a demo host with sample telemetry and incidents so
              every panel has real multi-host data to show. No live VM is
              enrolled — for a real endpoint, deploy the collector agent.
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-slate-500 transition hover:bg-white/5 hover:text-white"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-500">
              Hostname *
            </label>
            <input
              autoFocus
              value={form.hostname}
              onChange={(e) => setForm({ ...form, hostname: e.target.value })}
              placeholder="e.g. web-02"
              className="w-full rounded-lg border border-white/10 bg-slate-900 px-3 py-2 text-sm outline-none focus:border-cyan-500"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-500">
              IP Address
            </label>
            <input
              value={form.ip}
              onChange={(e) => setForm({ ...form, ip: e.target.value })}
              placeholder="optional — auto-assigned if blank"
              className="w-full rounded-lg border border-white/10 bg-slate-900 px-3 py-2 text-sm outline-none focus:border-cyan-500"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-500">
              Operating System
            </label>
            <input
              value={form.os}
              onChange={(e) => setForm({ ...form, os: e.target.value })}
              placeholder="optional — random default if blank"
              className="w-full rounded-lg border border-white/10 bg-slate-900 px-3 py-2 text-sm outline-none focus:border-cyan-500"
            />
          </div>

          {error && <p className="text-sm text-rose-400">{error}</p>}

          <div className="flex gap-2 pt-2">
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 rounded-xl bg-cyan-600 px-4 py-3 text-sm font-semibold transition hover:bg-cyan-500 disabled:opacity-50"
            >
              {submitting ? "Creating..." : "Create Host"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-white/10 px-4 py-3 text-sm text-slate-400 transition hover:border-white/20"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
