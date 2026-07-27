import { useState } from "react";

import { AuthProvider } from "./contexts/AuthContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import MainLayout from "./layouts/MainLayout";
import ErrorBoundary from "./components/common/ErrorBoundary";

import "./theme-light.css";

import Dashboard from "./pages/Dashboard";
import Assets from "./pages/Assets";
import Incidents from "./pages/Incidents";
import ThreatIntel from "./pages/ThreatIntel";
import Analytics from "./pages/Analytics";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";

const PAGES = {
  dashboard: Dashboard,
  assets: Assets,
  incidents: Incidents,
  threatintel: ThreatIntel,
  analytics: Analytics,
  reports: Reports,
  settings: Settings,
};

export default function App() {
  const [page, setPage] = useState("dashboard");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeSearch, setActiveSearch] = useState("");

  const ActivePage = PAGES[page] || Dashboard;

  function handleSearchSubmit(query) {
    const trimmed = (query ?? searchQuery).trim();
    setActiveSearch(trimmed);
    if (!trimmed) {
      setSearchQuery("");
    }
  }

  const pageSearch =
    page === "dashboard" || page === "assets" || page === "incidents" || page === "analytics"
      ? activeSearch
      : searchQuery;

  return (
    <ThemeProvider>
      <AuthProvider>
        <ErrorBoundary>
          <MainLayout
            page={page}
            setPage={setPage}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            activeSearch={activeSearch}
            onSearchSubmit={() => handleSearchSubmit(searchQuery)}
          >
            <ActivePage
              page={page}
              setPage={setPage}
              searchQuery={pageSearch}
              setSearchQuery={setSearchQuery}
            />
          </MainLayout>
        </ErrorBoundary>
      </AuthProvider>
    </ThemeProvider>
  );
}
