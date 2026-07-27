import { useEffect, useRef, useState } from "react";
import {
  Bell,
  CalendarDays,
  Clock3,
  LogOut,
  Moon,
  Search,
  Settings,
  Sun,
  UserCircle2,
} from "lucide-react";

import { useAuth } from "../../contexts/AuthContext";
import { useTheme } from "../../contexts/ThemeContext";
import LoginModal from "../auth/LoginModal";
import { getThreatFeed } from "../../services/dashboardService";
import { formatRelativeTime } from "../../utils/assetHelpers";

const PLACEHOLDERS = {
  dashboard: "Search hostname or IP, press Enter...",
  assets: "Search hostname, IP, or OS — press Enter",
  threatintel: "Search IOC, CVE, Hash...",
  incidents: "Search incidents — press Enter",
  reports: "Search reports...",
  analytics: "Search hosts or metrics — press Enter",
  settings: "Search settings...",
};

export default function Header({
  page = "dashboard",
  searchQuery = "",
  setSearchQuery = () => {},
  activeSearch = "",
  onSearchSubmit = () => {},
  setPage = () => {},
}) {
  const { user, isAuthenticated, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [showLogin, setShowLogin] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [now, setNow] = useState(new Date());

  const notifRef = useRef(null);
  const userRef = useRef(null);

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 30000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    async function loadNotifications() {
      try {
        const data = await getThreatFeed();
        const sorted = (Array.isArray(data) ? data : []).sort(
          (a, b) => new Date(b.time || 0) - new Date(a.time || 0)
        );
        setNotifications(sorted);
      } catch {
        setNotifications([]);
      }
    }

    loadNotifications();
    const timer = setInterval(loadNotifications, 15000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    function onDocClick(e) {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotifications(false);
      }
      if (userRef.current && !userRef.current.contains(e.target)) {
        setShowUserMenu(false);
      }
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  const date = now.toLocaleDateString("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  const time = now.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  const placeholder = PLACEHOLDERS[page] || "Search...";
  const openCount = notifications.filter((n) => n.status === "Open").length;

  function handleSearchSubmit(e) {
    e.preventDefault();
    const trimmed = searchQuery.trim();
    onSearchSubmit(trimmed);
    if (!trimmed) {
      setSearchQuery("");
    }
  }

  return (
    <>
      <header className="h-20 border-b border-white/8 bg-[#07111D]/80 backdrop-blur-xl">
        <div className="flex h-full items-center justify-between px-8">
          <div className="flex items-center gap-8">
            <form onSubmit={handleSearchSubmit} className="relative w-[430px]">
              <Search
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
              />
              <input
                type="text"
                placeholder={placeholder}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-2xl border border-white/10 bg-black/25 py-3 pl-12 pr-4 text-sm text-white outline-none transition focus:border-cyan-400/50 focus:ring-2 focus:ring-cyan-400/15"
              />
              {activeSearch && (
                <p className="absolute -bottom-5 left-1 text-xs text-cyan-400/80">
                  Active filter: {activeSearch}
                </p>
              )}
            </form>

            <div className="hidden xl:flex items-center gap-3 rounded-xl border border-white/10 bg-black/20 px-4 py-3">
              <CalendarDays size={18} className="text-cyan-400" />
              <div>
                <p className="text-xs uppercase text-slate-500">Today</p>
                <p className="text-sm font-medium text-white">{date}</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden lg:flex items-center gap-2 rounded-xl border border-white/10 bg-black/20 px-4 py-3">
              <Clock3 size={18} className="text-cyan-400" />
              <span className="font-medium">{time}</span>
            </div>

            <div className="relative" ref={notifRef}>
              <button
                type="button"
                onClick={() => {
                  setShowNotifications((v) => !v);
                  setShowUserMenu(false);
                }}
                className="relative rounded-xl border border-white/10 bg-black/20 p-3 transition hover:border-cyan-400/40"
                aria-label="Notifications"
              >
                <Bell size={20} />
                {openCount > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold">
                    {openCount}
                  </span>
                )}
              </button>

              {showNotifications && (
                <div className="absolute right-0 top-[calc(100%+8px)] z-40 w-80 overflow-hidden rounded-xl border border-white/10 bg-[#0b1220] shadow-2xl">
                  <div className="border-b border-white/8 px-4 py-3">
                    <p className="text-sm font-semibold">Notifications</p>
                  </div>
                  <div className="max-h-72 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <p className="p-4 text-sm text-slate-500">
                        No notifications.
                      </p>
                    ) : (
                      notifications.map((item) => (
                        <div
                          key={item.id}
                          className="border-b border-white/5 px-4 py-3 last:border-0"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <p className="text-sm font-medium leading-snug">
                              {item.title}
                            </p>
                            <span className="shrink-0 text-[10px] uppercase text-slate-500">
                              {item.severity}
                            </span>
                          </div>
                          <p className="mt-1 text-xs text-slate-500">
                            {item.hostname}
                          </p>
                          <p className="mt-1 text-[11px] text-slate-600">
                            {formatRelativeTime(item.time)}
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={toggleTheme}
              role="switch"
              aria-checked={theme === "light"}
              aria-label={
                theme === "light" ? "Switch to dark theme" : "Switch to light theme"
              }
              title={theme === "light" ? "Switch to dark theme" : "Switch to light theme"}
              className="rounded-xl border border-white/10 bg-black/20 p-3 transition hover:border-cyan-400/40"
            >
              {theme === "light" ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            <div className="relative" ref={userRef}>
              <button
                type="button"
                onClick={() => {
                  if (isAuthenticated) {
                    setShowUserMenu((v) => !v);
                  } else {
                    setShowLogin(true);
                  }
                  setShowNotifications(false);
                }}
                className="flex items-center gap-3 rounded-2xl border border-white/10 bg-black/20 px-4 py-2 transition hover:border-cyan-400/40"
              >
                <UserCircle2 size={42} className="text-cyan-400" />
                <div className="text-left">
                  <h3 className="font-semibold">
                    {isAuthenticated ? user.username : "Sign in"}
                  </h3>
                  <p className="text-xs text-slate-400">
                    {isAuthenticated ? user.role : "Click to login"}
                  </p>
                </div>
              </button>

              {showUserMenu && isAuthenticated && (
                <div className="absolute right-0 top-[calc(100%+8px)] z-40 w-56 overflow-hidden rounded-xl border border-white/10 bg-[#0b1220] py-1 shadow-2xl">
                  <div className="border-b border-white/8 px-4 py-3">
                    <p className="font-medium">@{user.username}</p>
                    <p className="text-xs text-slate-500">{user.name}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setPage("settings");
                      setShowUserMenu(false);
                    }}
                    className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-slate-300 hover:bg-white/5"
                  >
                    <Settings size={14} /> Account settings
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      logout();
                      setShowUserMenu(false);
                    }}
                    className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-rose-300 hover:bg-white/5"
                  >
                    <LogOut size={14} /> Sign out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <LoginModal open={showLogin} onClose={() => setShowLogin(false)} />
    </>
  );
}
