import { createContext, useContext, useState } from "react";

const AuthContext = createContext();

const getStoredJson = (key) => {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : null;
  } catch {
    localStorage.removeItem(key);
    return null;
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    return getStoredJson("expenseUser");
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

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext);
