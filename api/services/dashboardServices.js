const API = "http://192.168.175.195:5000";

export async function getDashboardSummary() {
    const response = await fetch(`${API}/dashboard/summary`);

    if (!response.ok) {
        throw new Error("Failed to fetch dashboard summary");
    }

    return await response.json();
}

export async function getRecentIncidents() {

    const response = await fetch(
        `${API_BASE}/dashboard/incidents`
    );

    if (!response.ok) {

        throw new Error("Failed to fetch incidents");

    }

    return response.json();

}
