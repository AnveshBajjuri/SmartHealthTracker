import { useState, useEffect, useCallback } from "react";
import {
  Plus,
  Flame,
  TrendingUp,
  CheckCircle,
  Sparkles,
  Award,
  Loader2,
} from "lucide-react";

import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import HabitCard from "../components/HabitCard";
import AddHabitModal from "../components/AddHabitModal";
import WeeklyChart from "../components/WeeklyChart";
import FocusRing from "../components/FocusRing";

import { habitApi } from "../utils/api";

export default function Dashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingHabit, setEditingHabit] = useState(null);

  const [habits, setHabits] = useState([]);
  const [completions, setCompletions] = useState({});
  const [filter, setFilter] = useState("all");

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // ===============================
  // LOAD ALL HABITS + COMPLETIONS
  // ===============================
  const loadData = useCallback(async () => {
    try {
      const habitsData = await habitApi.getAll();
      const completionsData = await habitApi.getAllCompletions();

      const fixed = (habitsData || []).map((h) => ({
        ...h,
        image_url:
          h.image_url?.startsWith("/media/")
            ? `http://127.0.0.1:8000${h.image_url}`
            : h.image_url,
      }));

      setHabits(fixed);
      setCompletions(completionsData || {});
    } catch (error) {
      console.error("Failed to load data:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // ===============================
  // SAVE HABIT (CREATE + UPDATE)
  // ===============================
  const handleSaveHabit = async (habitData) => {
    try {
      setIsSaving(true);

      const formData = new FormData();

      if (habitData.name) formData.append("name", habitData.name);
      if (habitData.description) formData.append("description", habitData.description);
      if (habitData.color) formData.append("color", habitData.color);
      if (habitData.icon) formData.append("icon", habitData.icon);
      if (habitData.target) formData.append("target", habitData.target);
      if (habitData.category) formData.append("category", habitData.category);
      if (habitData.difficulty) formData.append("difficulty", habitData.difficulty);

      if (habitData.image_file) {
        formData.append("image", habitData.image_file);
      }

      if (habitData.id) {
        // UPDATE habit
        await habitApi.updateForm(habitData.id, formData);
      } else {
        // CREATE habit
        await habitApi.createForm(formData);
      }

      await loadData();
      setModalOpen(false);
      setEditingHabit(null);
    } catch (err) {
      console.error("Habit save error:", err);
      alert("Failed to save habit. Try again.");
    } finally {
      setIsSaving(false);
    }
  };

  // ===============================
  // DELETE HABIT
  // ===============================
  const handleDeleteHabit = async (id) => {
    if (!confirm("Delete this habit?")) return;

    await habitApi.delete(id);
    loadData();
  };

  // ===============================
  // TOGGLE COMPLETION
  // ===============================
  const handleToggleCompletion = async (id) => {
    try {
      const result = await habitApi.toggleCompletion(id);

      const updatedCompletions = result?.completions || [];
      const updatedHabit = result?.habit || {};

      setCompletions((prev) => ({
        ...prev,
        [id]: updatedCompletions,
      }));

      setHabits((prev) =>
        prev.map((h) =>
          h.id === id
            ? {
                ...h,
                streak: updatedHabit.streak,
                totalCompletions: updatedHabit.totalCompletions,
              }
            : h
        )
      );
    } catch (err) {
      console.error("Toggle error:", err);
    }
  };

  // ===============================
  // EDIT HABIT
  // ===============================
  const handleEditHabit = (habit) => {
    setEditingHabit(habit);
    setModalOpen(true);
  };

  // ===============================
  // STATS
  // ===============================
  const today = new Date().toISOString().split("T")[0];

  const completedToday = habits.filter((h) =>
    (completions[h.id] || []).includes(today)
  ).length;

  const totalStreak = habits.reduce((sum, h) => sum + (h.streak || 0), 0);
  const longestStreak = habits.reduce(
    (max, h) => Math.max(max, h.streak || 0),
    0
  );

  // ===============================
  // FILTER
  // ===============================
  const filteredHabits = habits.filter((habit) => {
    const done = (completions[habit.id] || []).includes(today);

    if (filter === "all") return true;
    if (filter === "completed") return done;
    if (filter === "pending") return !done;
    return habit.category === filter;
  });

  const categories = [...new Set(habits.map((h) => h.category).filter(Boolean))];

  // ===============================
  // LOADING
  // ===============================
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-primary animate-spin" />
      </div>
    );
  }

  // ===============================
  // UI
  // ===============================
  return (
    <div className="min-h-screen bg-background flex">
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onAddHabit={() => setModalOpen(true)}
      />

      <main className="flex-1 min-w-0">
        <Navbar onMenuClick={() => setSidebarOpen(true)} />

        <div className="p-4 lg:p-6 space-y-6">
          {/* STATS CARDS */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard icon={CheckCircle} value={completedToday} label="Done Today" bg="from-emerald-500 to-teal-600" />
            <StatCard icon={Flame} value={totalStreak} label="Total Streaks" bg="from-orange-500 to-red-500" />
            <StatCard icon={Award} value={longestStreak} label="Best Streak" bg="from-purple-500 to-pink-500" />
            <StatCard
              icon={TrendingUp}
              value={habits.length ? Math.round((completedToday / habits.length) * 100) : 0}
              label="Daily Progress"
              bg="from-blue-500 to-cyan-500"
            />
          </div>

          {/* HABITS */}
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <HabitsSection
                habits={habits}
                filteredHabits={filteredHabits}
                filter={filter}
                setFilter={setFilter}
                categories={categories}
                today={today}
                completions={completions}
                onToggle={handleToggleCompletion}
                onEdit={handleEditHabit}
                onDelete={handleDeleteHabit}
                onAdd={() => setModalOpen(true)}
              />
            </div>

            <div className="space-y-6">
              <FocusRing habits={habits} completions={completions} />
              <WeeklyChart habits={habits} completions={completions} />
            </div>
          </div>
        </div>
      </main>

      <AddHabitModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingHabit(null);
        }}
        onSave={handleSaveHabit}
        editingHabit={editingHabit}
      />
    </div>
  );
}

// ===============================
// COMPONENTS
// ===============================

function StatCard({ icon: Icon, value, label, bg }) {
  return (
    <div className={`bg-gradient-to-br ${bg} rounded-2xl p-5 text-white shadow-lg`}>
      <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center mb-3">
        <Icon className="w-5 h-5" />
      </div>
      <p className="text-3xl font-bold">{value}</p>
      <p className="text-sm text-white/80">{label}</p>
    </div>
  );
}

function HabitsSection({
  habits,
  filteredHabits,
  filter,
  setFilter,
  categories,
  today,
  completions,
  onToggle,
  onEdit,
  onDelete,
  onAdd,
}) {
  return (
    <>
      <div className="flex flex-col sm:flex-row justify-between items-center mb-4">
        <div>
          <h2 className="text-xl font-bold text-foreground">Today's Habits</h2>
          <p className="text-sm text-muted">
            {new Date().toLocaleDateString("en-US", {
              weekday: "long",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 p-1 bg-surface rounded-xl overflow-x-auto">
            {["all", "pending", "completed", ...categories].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-2 rounded-lg text-sm font-medium ${
                  filter === f
                    ? "bg-primary text-white shadow"
                    : "text-muted hover:text-foreground"
                }`}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>

          <button
            onClick={onAdd}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl shadow-lg hover:bg-primary-hover"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Add Habit</span>
          </button>
        </div>
      </div>

      {habits.length === 0 ? (
        <EmptyState onAdd={onAdd} />
      ) : filteredHabits.length === 0 ? (
        <div className="bg-surface rounded-3xl p-8 text-center card-shadow">
          <p className="text-muted">No habits match this filter</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {filteredHabits.map((habit) => {
            const done = (completions[habit.id] || []).includes(today);

            return (
              <HabitCard
                key={habit.id}
                habit={habit}
                isCompleted={done}
                onToggle={onToggle}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            );
          })}
        </div>
      )}
    </>
  );
}

function EmptyState({ onAdd }) {
  return (
    <div className="bg-surface rounded-3xl p-12 card-shadow text-center">
      <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-primary/20 to-orange-100 flex items-center justify-center">
        <Sparkles className="w-12 h-12 text-primary" />
      </div>
      <h3 className="text-2xl font-bold text-foreground mb-2">Start Your Journey</h3>
      <p className="text-muted mb-8 mx-auto max-w-md">
        Create your first habit and begin building the life you want.
      </p>
      <button
        onClick={onAdd}
        className="px-8 py-4 bg-gradient-to-r from-primary to-orange-500 text-white rounded-2xl shadow-lg"
      >
        Create Your First Habit
      </button>
    </div>
  );
}
