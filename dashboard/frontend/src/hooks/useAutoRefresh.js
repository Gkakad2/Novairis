import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Polls `loader` when auto-update is enabled.
 * Returns controls so pages can expose a toggle + interval picker.
 */
export function useAutoRefresh(loader, {
  enabled: initialEnabled = true,
  intervalMs: initialInterval = 10000,
  deps = [],
} = {}) {
  const [autoUpdate, setAutoUpdate] = useState(initialEnabled);
  const [intervalMs, setIntervalMs] = useState(initialInterval);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [loading, setLoading] = useState(true);
  const loaderRef = useRef(loader);

  useEffect(() => {
    loaderRef.current = loader;
  }, [loader]);

  const refresh = useCallback(async ({ silent = false } = {}) => {
    if (!silent) setLoading(true);
    try {
      await loaderRef.current();
      setLastUpdated(new Date());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      if (!cancelled) await refresh();
    })();

    if (!autoUpdate) return () => { cancelled = true; };

    const timer = setInterval(() => {
      refresh({ silent: true });
    }, intervalMs);

    return () => {
      cancelled = true;
      clearInterval(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoUpdate, intervalMs, refresh, ...deps]);

  return {
    autoUpdate,
    setAutoUpdate,
    intervalMs,
    setIntervalMs,
    lastUpdated,
    loading,
    refresh,
  };
}
