import { apiUrl } from "../config";

export async function getIncidents({ status = null, hostname = null } = {}) {
  const params = new URLSearchParams();

  if (status) params.set("status", status);
  if (hostname) params.set("hostname", hostname);

  const query = params.toString();
  const url = apiUrl(query ? `/incidents?${query}` : "/incidents");

  const response = await fetch(url, { cache: "no-store" });

  if (!response.ok) {
    throw new Error("Failed to fetch incidents");
  }

  return await response.json();
}
