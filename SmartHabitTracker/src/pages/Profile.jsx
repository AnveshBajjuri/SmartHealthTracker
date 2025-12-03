import { useState, useEffect, useCallback, useRef } from "react"
import {
  User,
  Mail,
  Calendar,
  Award,
  TrendingUp,
  Save,
  Camera,
  Loader2
} from "lucide-react"

import Sidebar from "../components/Sidebar"
import Navbar from "../components/Navbar"
import { useAuth } from "../context/AuthContext"
import { habitApi } from "../utils/api"

export default function Profile() {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const { user, updateProfile, updateAvatar } = useAuth()

  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [habits, setHabits] = useState([])
  const [stats, setStats] = useState({})
  const [isLoading, setIsLoading] = useState(true)

  const fileInputRef = useRef(null)
  const [avatar, setAvatar] = useState(null)

  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || ""
  })

  const [saved, setSaved] = useState(false)

  // ⭐ FIX — Actually compute stats with safe fields
  const calculateStats = (habitsList) => {
    let total_completions = 0
    let longest_streak = 0

    habitsList.forEach((h) => {
      total_completions += h.total_completions || h.totalCompletions || 0
      longest_streak = Math.max(longest_streak, h.streak || 0)
    })

    return {
      total_habits: habitsList.length,
      longest_streak,
      total_completions,
      completion_rate:
        habitsList.length > 0
          ? Math.round((total_completions / (habitsList.length * 7)) * 100)
          : 0
    }
  }

  // ⭐ FIX — load habits safely
  const loadData = useCallback(async () => {
    try {
      const raw = await habitApi.getAll()

      const safeList = Array.isArray(raw)
        ? raw
        : raw?.habits || []   // fallback structure

      setHabits(safeList)
      setStats(calculateStats(safeList))
    } catch (error) {
      console.error("Failed to load data:", error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  // Sync form when user loads
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        email: user.email || ""
      })
    }
  }, [user])

  const handleFileSelect = (e) => {
    setAvatar(e.target.files[0])
  }

  const handleSave = async () => {
    setIsSaving(true)

    try {
      await updateProfile({
        name: formData.name,
        email: formData.email
      })

      if (avatar) {
        await updateAvatar(avatar)
      }

      setIsEditing(false)
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch (error) {
      console.error("Profile update failed:", error)
      alert("Failed to update profile. Try again.")
    } finally {
      setIsSaving(false)
    }
  }

  const memberSince = user?.createdAt || user?.created_at
    ? new Date(user.createdAt || user.created_at).toLocaleDateString("en-US", {
        month: "long",
        year: "numeric"
      })
    : "Recently"

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 text-primary animate-spin" />
          <p className="text-muted">Loading profile...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <main className="flex-1 min-w-0">
        <Navbar onMenuClick={() => setSidebarOpen(true)} />

        <div className="p-4 lg:p-6 max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold text-foreground mb-6">Profile</h1>

          {/* MAIN CARD */}
          <div className="bg-surface rounded-3xl p-6 md:p-8 card-shadow mb-6">
            <div className="flex flex-col md:flex-row items-center gap-6 mb-8">

              {/* AVATAR */}
              <div className="relative">
                <div className="w-28 h-28 rounded-full bg-gradient-to-br from-primary to-orange-400 flex items-center justify-center text-white text-4xl font-bold shadow-xl overflow-hidden">

                  {avatar ? (
                    <img
                      src={URL.createObjectURL(avatar)}
                      className="w-full h-full object-cover rounded-full"
                    />
                  ) : user?.avatar_url ? (
                    <img
                      src={user.avatar_url}
                      className="w-full h-full object-cover rounded-full"
                    />
                  ) : (
                    (user?.name?.charAt(0) || "U").toUpperCase()
                  )}
                </div>

                {/* Camera Button */}
                <button
                  onClick={() => fileInputRef.current.click()}
                  className="absolute bottom-0 right-0 w-10 h-10 rounded-full bg-surface border-4 border-background flex items-center justify-center text-muted hover:text-primary transition-colors shadow-lg"
                >
                  <Camera className="w-5 h-5" />
                </button>

                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileSelect}
                  accept="image/*"
                  className="hidden"
                />
              </div>

              {/* USER INFO */}
              <div className="text-center md:text-left">
                <h2 className="text-2xl font-bold text-foreground mb-1">
                  {user?.name || "User"}
                </h2>
                <p className="text-muted mb-2">{user?.email}</p>

                <div className="flex items-center justify-center md:justify-start gap-2 text-sm text-muted">
                  <Calendar className="w-4 h-4" />
                  <span>Member since {memberSince}</span>
                </div>
              </div>

              {/* EDIT / SAVE BUTTON */}
              <div className="md:ml-auto">
                {!isEditing ? (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="px-5 py-3 bg-primary hover:bg-primary-hover text-white rounded-2xl font-medium"
                  >
                    Edit Profile
                  </button>
                ) : (
                  <button
                    disabled={isSaving}
                    onClick={handleSave}
                    className="flex items-center gap-2 px-5 py-3 bg-secondary hover:bg-emerald-600 text-white rounded-2xl font-medium disabled:opacity-50"
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="w-5 h-5" />
                        Save
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>

            {/* SUCCESS BANNER */}
            {saved && (
              <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-600 text-sm">
                Profile updated successfully!
              </div>
            )}

            {/* EDIT FORM */}
            {isEditing && (
              <div className="grid md:grid-cols-2 gap-6 mb-8 p-6 bg-background rounded-2xl">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted" />
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      className="w-full pl-12 pr-4 py-3 bg-surface rounded-xl border"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted" />
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      className="w-full pl-12 pr-4 py-3 bg-surface rounded-xl border"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* STATS */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-gradient-to-br from-primary to-orange-400 rounded-2xl p-5 text-white">
                <TrendingUp className="w-6 h-6 mb-3 opacity-80" />
                <p className="text-3xl font-bold">{stats.total_habits}</p>
                <p className="text-sm opacity-80">Active Habits</p>
              </div>

              <div className="bg-gradient-to-br from-secondary to-teal-400 rounded-2xl p-5 text-white">
                <Award className="w-6 h-6 mb-3 opacity-80" />
                <p className="text-3xl font-bold">{stats.longest_streak}</p>
                <p className="text-sm opacity-80">Best Streak</p>
              </div>

              <div className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl p-5 text-white">
                <Calendar className="w-6 h-6 mb-3 opacity-80" />
                <p className="text-3xl font-bold">{stats.total_completions}</p>
                <p className="text-sm opacity-80">Completions</p>
              </div>

              <div className="bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl p-5 text-white">
                <Award className="w-6 h-6 mb-3 opacity-80" />
                <p className="text-3xl font-bold">{stats.completion_rate}%</p>
                <p className="text-sm opacity-80">Success Rate</p>
              </div>
            </div>
          </div>

          {/* HABIT LIST */}
          <div className="bg-surface rounded-3xl p-6 md:p-8 card-shadow">
            <h3 className="text-lg font-semibold text-foreground mb-4">
              Your Habits
            </h3>

            {(!Array.isArray(habits) || habits.length === 0) ? (
              <p className="text-muted text-center py-8">
                No habits yet. Start tracking!
              </p>
            ) : (
              <div className="space-y-3">
                {(Array.isArray(habits) ? habits : []).map((habit) => (
                  <div
                    key={habit.id}
                    className="flex items-center gap-4 p-4 bg-background rounded-2xl"
                  >
                    <div className="w-12 h-12 rounded-xl bg-primary-light flex items-center justify-center text-2xl">
                      {habit.icon || "🎯"}
                    </div>

                    <div className="flex-1">
                      <h4 className="font-medium text-foreground">
                        {habit.name}
                      </h4>
                      <p className="text-sm text-muted">{habit.target}</p>
                    </div>

                    <div className="text-right">
                      <p className="font-semibold text-foreground">
                        {habit.streak} days
                      </p>
                      <p className="text-sm text-muted">streak</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
