import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [role, setRole] = useState(localStorage.getItem("role"));
  const [username, setUsername] = useState(localStorage.getItem("username"));

  const login = (token, role, username) => {
    localStorage.setItem("token", token);
    localStorage.setItem("role", role);
    localStorage.setItem("username", username);
    setToken(token);
    setRole(role);
    setUsername(username);
  };

  const logout = () => {
    localStorage.clear();
    setToken(null);
    setRole(null);
    setUsername(null);
  };

  const isAuthenticated = () => !!token;
  const isAdmin = () => role === "admin";

  return (
    <AuthContext.Provider value={{ token, role, username, login, logout, isAuthenticated, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};
