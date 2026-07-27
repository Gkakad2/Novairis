/**
 * Central API base URL. Override with VITE_API_URL when deploying
 * against a different collector/backend host.
 */
export const API_URL =
  import.meta.env.VITE_API_URL || "http://192.168.175.195:5000";

export function apiUrl(path = "") {
  const base = API_URL.replace(/\/$/, "");
  const suffix = path.startsWith("/") ? path : `/${path}`;
  return `${base}${suffix}`;
}
