import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import api from "../services/api";

const AuthContext = createContext(null);
const TOKEN_KEY = "transsafe_token";
const USER_KEY = "transsafe_user";

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY));
  const [user, setUser] = useState(() => { try { return JSON.parse(localStorage.getItem(USER_KEY)); } catch { return null; } });
  const [loading, setLoading] = useState(Boolean(token));
  const logout = useCallback(() => { localStorage.removeItem(TOKEN_KEY); localStorage.removeItem(USER_KEY); setToken(null); setUser(null); }, []);
  useEffect(() => {
    if (!token) { setLoading(false); return; }
    api.get("/auth/me", { headers: { Authorization: `Bearer ${token}` } }).then((res) => { const next = res.data.data; setUser(next); localStorage.setItem(USER_KEY, JSON.stringify(next)); }).catch(logout).finally(() => setLoading(false));
  }, [token, logout]);
  const login = useCallback(async (email, password) => { const res = await api.post("/auth/login", { email, password }); const { token: nextToken, user: nextUser } = res.data.data; localStorage.setItem(TOKEN_KEY, nextToken); localStorage.setItem(USER_KEY, JSON.stringify(nextUser)); setToken(nextToken); setUser(nextUser); return nextUser; }, []);
  const value = useMemo(() => ({ user, token, loading, login, logout, isAuthenticated: Boolean(token && user) }), [user, token, loading, login, logout]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
export function useAuth() { return useContext(AuthContext); }
export default AuthContext;
