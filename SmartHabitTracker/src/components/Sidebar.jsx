import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Bell,
  Sparkles,
  User,
  LogOut,
  Plus,
  X,
  Target,
} from "lucide-react";

import { useAuth } from "../context/AuthContext";

export default function Sidebar({
  isOpen = false,
  onClose = () => {},
  onAddHabit = () => {},
}) {
  const { user, logout } = useAuth();

  // ---------------------------
  // ⚡ FIX 1: Avatar priority
  // ---------------------------
  const avatarUrl =
    user?.avatar_url ||
    user?.avatar ||
    localStorage.getItem("avatar_url") ||
    null;

  const username =
    user?.name ||
    user?.username ||
    localStorage.getItem("username") ||
    "User";

  // ---------------------------
  // ⚡ FIX 2: Routes must match App.jsx
  // ---------------------------
  const navItems = [
    { path: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { path: "/reminder", icon: Bell, label: "Reminders" },
    { path: "/ai", icon: Sparkles, label: "AI Insights" },
    { path: "/profile", icon: User, label: "Profile" },
  ];

  const NavContent = () => (
    <>
      <div className="p-6">
        {/* LOGO */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-orange-400 flex items-center justify-center shadow">
            <Target className="w-5 h-5 text-white" />
          </div>
          <span className="font-semibold text-lg text-foreground">HabitFlow</span>
        </div>

        {/* USER CARD */}
        <div className="flex items-center gap-3 p-3 bg-primary-light rounded-2xl mb-8 shadow">
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt="avatar"
              className="w-12 h-12 rounded-full object-cover shadow-md"
            />
          ) : (
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-500 to-pink-500 text-white flex items-center justify-center text-lg font-semibold">
              {username.charAt(0).toUpperCase()}
            </div>
          )}

          <div>
            <p className="font-medium text-foreground">{username}</p>
          </div>
        </div>

        {/* NAVIGATION ITEMS */}
        <nav className="space-y-2">
          {navItems.map(({ path, icon: Icon, label }) => (
            <NavLink
              key={path}
              to={path}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                  isActive
                    ? "bg-surface-dark text-white shadow-lg"
                    : "text-muted hover:text-foreground hover:bg-surface"
                }`
              }
            >
              <Icon className="w-5 h-5" />
              <span className="font-medium">{label}</span>
            </NavLink>
          ))}
        </nav>
      </div>

      {/* FOOTER BUTTONS */}
      <div className="p-6 mt-auto">

        {/* ADD HABIT */}
        <button
          onClick={onAddHabit}
          className="w-full flex items-center justify-center gap-2 px-4 py-4 bg-primary hover:bg-primary-hover text-white rounded-2xl transition-all duration-200 shadow hover:shadow-xl mb-4"
        >
          <Plus className="w-5 h-5" />
          <span className="font-medium">Add New Habit</span>
        </button>

        {/* LOGOUT */}
        <button
          onClick={logout}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 text-muted hover:text-danger hover:bg-red-50 rounded-xl transition-all duration-200"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* DESKTOP SIDEBAR */}
      <aside className="hidden lg:flex flex-col w-72 bg-surface rounded-3xl m-4 card-shadow h-[calc(100vh-2rem)]">
        <NavContent />
      </aside>

      {/* MOBILE SIDEBAR */}
      {isOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          />

          <aside className="absolute left-0 top-0 bottom-0 w-72 bg-surface shadow-2xl flex flex-col">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 text-muted hover:text-foreground"
            >
              <X className="w-6 h-6" />
            </button>
            <NavContent />
          </aside>
        </div>
      )}
    </>
  );
}
