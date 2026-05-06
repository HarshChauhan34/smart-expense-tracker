import { createContext, useContext, useState } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    return JSON.parse(localStorage.getItem("expenseUser")) || null;
  });

  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem("darkMode") === "true";
  });

  const loginUser = (userData) => {
    localStorage.setItem("expenseUser", JSON.stringify(userData));
    setUser(userData);
  };

  const logoutUser = () => {
    localStorage.removeItem("expenseUser");
    setUser(null);
  };

  const toggleDarkMode = () => {
    localStorage.setItem("darkMode", String(!darkMode));
    setDarkMode(!darkMode);
  };

  return (
    <AuthContext.Provider
      value={{ user, loginUser, logoutUser, darkMode, toggleDarkMode }}
    >
      <div className={darkMode ? "dark" : ""}>{children}</div>
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);