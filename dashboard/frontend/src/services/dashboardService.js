import { API_URL, apiUrl } from "../config";

export async function getDashboardSummary() {
  const response = await fetch(apiUrl("/dashboard/summary"), {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Failed to fetch dashboard summary");
  }

  return await response.json();
}

export async function getHostResources() {
  const response = await fetch(apiUrl("/dashboard/resources"), {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Failed to fetch host resources");
  }

  return await response.json();
}

export async function getThreatFeed() {
  const response = await fetch(apiUrl("/dashboard/threat-feed"), {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Failed to fetch threat feed");
  }

  return await response.json();
}

export { API_URL };
