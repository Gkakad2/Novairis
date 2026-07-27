import { apiUrl } from "../config";

export async function getThreatIntelligence() {
  const response = await fetch(apiUrl("/dashboard/threat-intelligence"), {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Failed to fetch threat intelligence");
  }

  return await response.json();
}

export async function getTopMitre() {
  const response = await fetch(apiUrl("/dashboard/top-mitre"), {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Failed to fetch top MITRE techniques");
  }

  return await response.json();
}
