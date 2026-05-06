import { useEffect, useRef, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import {
  BarChart3,
  Brain,
  Bell,
  LayoutDashboard,
  List,
  LogOut,
  Moon,
  PlusCircle,
  Repeat,
  Sun,
  Target,
  UserCircle,
  Wallet,
  Trophy,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import ConfirmDialog from "./ConfirmDialog";
import { getUnreadCount } from "../services/notificationService";

function AppLayout({ children }) {
  const { user, logoutUser, darkMode, toggleDarkMode } = useAuth();
  const navigate = useNavigate();

  const [menuOpen, setMenuOpen] = useState(false);
  const [logoutConfirm, setLogoutConfirm] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const navItems = [
    { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
    { name: "Add Transaction", path: "/add-transaction", icon: PlusCircle },
    { name: "Transactions", path: "/transactions", icon: List },
    { name: "Reports", path: "/reports", icon: BarChart3 },
    { name: "Budget", path: "/budget", icon: Target },
    { name: "Recurring", path: "/recurring", icon: Repeat },
    { name: "Goals", path: "/saving-goals", icon: Trophy },
    { name: "AI", path: "/ai-insights", icon: Brain },
  ];

  const mobileNavItems = [
    { name: "Home", path: "/dashboard", icon: LayoutDashboard },
    // { name: "Add", path: "/add-transaction", icon: PlusCircle },
    { name: "Transactions", path: "/transactions", icon: List },
    { name: "Reports", path: "/reports", icon: BarChart3 },
    { name: "Budget", path: "/budget", icon: Target },
    { name: "AI", path: "/ai-insights", icon: Brain },
    // { name: "Recurring", path: "/recurring", icon: Repeat },
  ];

  const menuRef = useRef(null);

  const fetchUnreadCount = async () => {
    try {
      const res = await getUnreadCount();
      setUnreadCount(res.data.count);
    } catch (error) {
      console.log(error);
    }
  };
  useEffect(() => {
    fetchUnreadCount();
  }, []);

  const getInitials = (name = "") => {
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    setMenuOpen(false);
    setLogoutConfirm(true);
  };

  const confirmLogout = () => {
    logoutUser();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950">
      {/* Desktop Sidebar */}
      <aside className="fixed left-0 top-0 z-40 hidden h-screen w-72 border-r border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 lg:block">
        <Link to="/dashboard" className="mb-8 flex items-center gap-3">
          <div className="rounded-2xl bg-indigo-600 p-3 text-white">
            <Wallet size={26} />
          </div>

          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">
              SpendSense AI
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Smart Expense Tracker
            </p>
          </div>
        </Link>

        <nav className="space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold transition ${
                    isActive
                      ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/20"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
                  }`
                }
              >
                <Icon size={20} />
                {item.name}
              </NavLink>
            );
          })}
        </nav>
      </aside>

      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 backdrop-blur-xl dark:border-slate-800 dark:bg-slate-900/90 lg:ml-72">
        <div className="flex items-center justify-between px-4 py-4 lg:px-8">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Welcome, {user?.name}
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Manage your income, expenses and reports
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Dark Mode Button */}
            <button
              onClick={toggleDarkMode}
              className="rounded-2xl border border-slate-200 bg-white p-3 text-slate-700 shadow-sm hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
              title="Toggle Theme"
            >
              {darkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            {/* Notification Button */}
            <button
              onClick={() => navigate("/notifications")}
              className="relative rounded-2xl border border-slate-200 bg-white p-3 text-slate-700 shadow-sm hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
              title="Notifications"
            >
              <Bell size={18} />

              {unreadCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-600 px-1 text-xs font-black text-white">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </button>

            {/* Profile Menu */}
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="flex items-center justify-center rounded-2xl border border-slate-200 bg-white p-2 shadow-sm hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-linear-to-br from-indigo-600 to-emerald-500 text-sm font-black text-white shadow-md">
                  {getInitials(user?.name)}
                </div>
              </button>

              {menuOpen && (
                <div className="absolute right-0 mt-3 w-64 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900">
                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      navigate("/profile");
                    }}
                    className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800"
                  >
                    <UserCircle size={18} />
                    Profile
                  </button>

                  <button
                    onClick={handleLogout}
                    className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm font-semibold text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/40"
                  >
                    <LogOut size={18} />
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="pb-24 lg:ml-72">
        <div className="px-4 py-6 lg:px-8">{children}</div>
      </main>

      {/* Mobile Bottom Nav */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 grid grid-cols-5 border-t border-slate-200 bg-white px-2 py-2 dark:border-slate-800 dark:bg-slate-900 lg:hidden">
        {mobileNavItems.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center rounded-2xl px-2 py-2 text-xs font-semibold ${
                  isActive
                    ? "bg-indigo-600 text-white"
                    : "text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
                }`
              }
            >
              <Icon size={20} />
              <span className="mt-1">{item.name}</span>
            </NavLink>
          );
        })}
      </nav>

      <ConfirmDialog
        open={logoutConfirm}
        title="Logout?"
        message="Are you sure you want to logout from your account?"
        confirmText="Yes, Logout"
        type="danger"
        onCancel={() => setLogoutConfirm(false)}
        onConfirm={confirmLogout}
      />
    </div>
  );
}

export default AppLayout;
