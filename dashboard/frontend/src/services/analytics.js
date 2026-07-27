import { apiUrl } from "../config";

export async function getAnalytics({ hostname = null, hours = 72 } = {}) {
  const params = new URLSearchParams();

  if (hostname) params.set("hostname", hostname);
  if (hours) params.set("hours", String(hours));

  const query = params.toString();
  const url = apiUrl(query ? `/analytics?${query}` : "/analytics");

  const response = await fetch(url, { cache: "no-store" });

  if (!response.ok) {
    throw new Error("Failed to fetch analytics");
  }

  return await response.json();
}
