const API_URL = "http://192.168.175.195:5000";

export async function getHosts() {
  const response = await fetch(`${API_URL}/hosts`, { cache: "no-store" });
  if (!response.ok) throw new Error("Failed to fetch hosts");
  return await response.json();
}

export async function createDemoHost({ hostname, ip, os, kernel }) {
  const response = await fetch(`${API_URL}/hosts/demo`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ hostname, ip, os, kernel }),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.error || "Failed to create demo host");
  }
  return data;
}

export async function deleteHost(hostname) {
  const response = await fetch(
    `${API_URL}/hosts/${encodeURIComponent(hostname)}`,
    { method: "DELETE" }
  );
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.error || "Failed to delete host");
  }
  return data;
}
