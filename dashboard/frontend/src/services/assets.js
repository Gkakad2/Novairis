import { apiUrl } from "../config";

export async function getAssets() {
  const response = await fetch(apiUrl("/assets"), { cache: "no-store" });

  if (!response.ok) {
    throw new Error("Failed to fetch assets");
  }

  return await response.json();
}

export async function getHosts() {
  const response = await fetch(apiUrl("/hosts"), { cache: "no-store" });

  if (!response.ok) {
    throw new Error("Failed to fetch hosts");
  }

  return await response.json();
}
