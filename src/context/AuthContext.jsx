import { createContext, useContext, useState, useEffect } from "react";
import { api } from "../utils/api";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("userRole") || "user";
    if (token) {
      const meUrl = role === "owner" ? "/api/auth/owner/me" : "/api/auth/me";
      api.get(meUrl)
        .then(res => {
          setUser({
            ...res.data,
            role: role,
            name: role === "owner" ? res.data.owner_name : res.data.full_name
          });
        })
        .catch(() => {
          localStorage.removeItem("token");
          localStorage.removeItem("userRole");
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email, password, role = "user") => {
    const url = role === "owner" ? "/api/auth/owner/login" : "/api/auth/login";
    const meUrl = role === "owner" ? "/api/auth/owner/me" : "/api/auth/me";
    const normalizedEmail = email.trim().toLowerCase();
    
    const params = new URLSearchParams();
    params.append("username", normalizedEmail);
    params.append("password", password);
    
    const res = await api.post(url, params, {
      headers: { "Content-Type": "application/x-www-form-urlencoded" }
    });
    
    localStorage.setItem("token", res.data.access_token);
    localStorage.setItem("userRole", role);

    try {
      const me = await api.get(meUrl);
      const userData = {
        ...me.data,
        role: role,
        name: role === "owner" ? me.data.owner_name : me.data.full_name
      };
      setUser(userData);
      return userData;
    } catch (error) {
      localStorage.removeItem("token");
      localStorage.removeItem("userRole");
      throw error;
    }
  };

  const register = async (data, role = "user") => {
    const normalizedEmail = data.email.trim().toLowerCase();
    if (role === "owner") {
      await api.post("/api/auth/owner/register", {
        owner_name: data.name,
        email: normalizedEmail,
        password: data.password,
        phone: data.phone || "",
        notes: data.pgName || ""
      });
      await login(normalizedEmail, data.password, "owner");
    } else {
      await api.post("/api/auth/register", {
        full_name: data.name,
        email: normalizedEmail,
        password: data.password,
        phone: data.phone?.trim() || null
      });
      await login(normalizedEmail, data.password, "user");
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userRole");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}


export function useAuth() {
  return useContext(AuthContext);
}