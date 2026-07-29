import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { authApi } from "../api/auth";
import { tokenStore, setUnauthorizedHandler } from "../api/client";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState(null);
  const [status, setStatus] = useState("loading"); // loading | authed | guest

  const loadMe = useCallback(async () => {
    if (!tokenStore.get()) {
      setStatus("guest");
      return;
    }
    try {
      const data = await authApi.getMe();
      setUser(data.user);
      setStats(data.stats);
      setStatus("authed");
    } catch {
      tokenStore.clear();
      setUser(null);
      setStatus("guest");
    }
  }, []);

  useEffect(() => {
    loadMe();
    // Any 401 from the API (expired/invalid token) drops us back to guest.
    setUnauthorizedHandler(() => {
      tokenStore.clear();
      setUser(null);
      setStatus("guest");
    });
  }, [loadMe]);

  const login = async (payload) => {
    const data = await authApi.login(payload); // may throw 403 needsVerification
    tokenStore.set(data.token);
    setUser(data.user);
    setStatus("authed");
    return data;
  };

  const completeVerification = async (payload) => {
    const data = await authApi.verifyOtp(payload);
    tokenStore.set(data.token);
    setUser(data.user);
    setStatus("authed");
    return data;
  };

  const logout = () => {
    tokenStore.clear();
    setUser(null);
    setStats(null);
    setStatus("guest");
  };

  const refreshMe = () => loadMe();

  return (
    <AuthContext.Provider
      value={{ user, stats, status, login, completeVerification, logout, refreshMe, setUser }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
