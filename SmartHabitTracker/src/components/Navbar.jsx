import { Menu, Search, Bell } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

export default function Navbar({ onMenuClick = () => {} }) {
  const { user } = useAuth()

  const handleNotifications = () => {
    alert("🔔 No new notifications right now!");
  }

  // ⭐ Avatar Priority:
  // 1. user.avatar_url from backend
  // 2. localStorage avatar for refresh fallback
  // 3. First letter fallback
  const avatarUrl =
    user?.avatar_url ||
    localStorage.getItem("avatar_url") ||
    null

  return (
    <header className="flex items-center justify-between p-4 lg:p-6">

      <button
        onClick={onMenuClick}
        className="lg:hidden p-2 text-muted hover:text-foreground rounded-xl hover:bg-surface transition-colors"
      >
        <Menu className="w-6 h-6" />
      </button>

      {/* Search Bar */}
      <div className="hidden md:flex items-center gap-4 flex-1 max-w-md">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted" />
          <input
            type="text"
            placeholder="Search habits..."
            className="w-full pl-12 pr-4 py-3 bg-surface rounded-2xl border-0 focus:ring-2 focus:ring-primary/20 transition-all"
          />
        </div>
      </div>

      <div className="flex items-center gap-4">

        {/* Notifications */}
        <button
          onClick={handleNotifications}
          className="relative p-3 bg-surface rounded-2xl text-muted hover:text-foreground transition-colors card-shadow"
        >
          <Bell className="w-5 h-5" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full" />
        </button>

        {/* ⭐ USER AVATAR FIX */}
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt="avatar"
            className="w-12 h-12 rounded-2xl object-cover shadow-lg"
          />
        ) : (
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-400 to-pink-500 flex items-center justify-center text-white font-semibold text-lg card-shadow">
            {user?.name?.charAt(0)?.toUpperCase() || 'U'}
          </div>
        )}
      </div>
    </header>
  )
}
