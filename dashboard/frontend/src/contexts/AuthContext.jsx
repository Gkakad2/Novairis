import { createContext, useContext, useEffect, useMemo, useState } from "react";

const AuthContext = createContext(null);

const USERS = [
  {
    username: "admin",
    password: "admin123",
    name: "Administrator",
    role: "Security Operations",
  },
  {
    username: "analyst",
    password: "analyst123",
    name: "SOC Analyst",
    role: "Threat Hunter",
  },
];

const STORAGE_KEY = "novairis_session";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setUser(JSON.parse(raw));
    } catch {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  function login(username, password) {
    const match = USERS.find(
      (u) => u.username === username.trim() && u.password === password
    );

    if (!match) {
      throw new Error("Invalid username or password.");
    }

    const session = {
      username: match.username,
      name: match.name,
      role: match.role,
    };

    setUser(session);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
    return session;
  }

  function logout() {
    setUser(null);
    localStorage.removeItem(STORAGE_KEY);
  }

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      login,
      logout,
      demoCredentials: USERS.map(({ username, password, name }) => ({
        username,
        password,
        name,
      })),
    }),
    [user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
