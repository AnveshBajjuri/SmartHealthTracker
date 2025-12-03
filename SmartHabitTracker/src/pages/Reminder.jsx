import { useState, useEffect, useCallback } from "react";
import {
  Plus,
  Bell,
  Clock,
  Trash2,
  ToggleLeft,
  ToggleRight,
  X,
  Loader2,
  Calendar,
  Sparkles,
} from "lucide-react";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import { reminderApi, habitApi } from "../utils/api";

export default function Reminder() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  const [reminders, setReminders] = useState([]);
  const [habits, setHabits] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [customDaysOpen, setCustomDaysOpen] = useState(false);

  const weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  const [formData, setFormData] = useState({
    habit: "",
    time: "09:00",
    days: "everyday",
    custom_days: [],
    message: "",
  });

  // SMART MESSAGES FOR USER
  const smartMessages = [
    "Stay consistent, future you will thank you!",
    "Time to level up your habits! 🔥",
    "Small steps create big changes.",
    "Your future self is waiting!",
    "Let’s make today productive! 🚀",
  ];

  // Load data
  const loadData = useCallback(async () => {
    try {
      const [remindersData, habitsData] = await Promise.all([
        reminderApi.getAll(),
        habitApi.getAll(),
      ]);

      setReminders(Array.isArray(remindersData) ? remindersData : []);
      setHabits(Array.isArray(habitsData) ? habitsData : []);
    } catch (error) {
      console.error("Failed to load data:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      await reminderApi.create({
        habit: formData.habit || null,
        time: formData.time,
        days: formData.days,
        custom_days: formData.custom_days,
        message:
          formData.message ||
          smartMessages[Math.floor(Math.random() * smartMessages.length)],
      });

      await loadData();
      setModalOpen(false);

      setFormData({
        habit: "",
        time: "09:00",
        days: "everyday",
        custom_days: [],
        message: "",
      });
    } catch (error) {
      console.error("Failed to create reminder:", error);
      alert("Failed to create reminder");
    } finally {
      setIsSaving(false);
    }
  };

  // Toggle
  const handleToggle = async (id) => {
    try {
      const result = await reminderApi.toggle(id);
      setReminders((prev) =>
        prev.map((r) =>
          r.id === id ? { ...r, is_active: result?.is_active } : r
        )
      );
    } catch (error) {
      console.error("Toggle failed");
    }
  };

  // Delete
  const handleDelete = async (id) => {
    if (!confirm("Delete this reminder?")) return;

    try {
      await reminderApi.delete(id);
      setReminders((prev) => prev.filter((r) => r.id !== id));
    } catch (err) {
      console.error("Delete failed");
      alert("Failed to delete reminder");
    }
  };

  // Format time AM/PM
  const formatTime = (t) => {
    if (!t) return "";
    let [h, m] = t.split(":");
    h = parseInt(h);
    const ampm = h >= 12 ? "PM" : "AM";
    const d = h % 12 || 12;
    return `${d}:${m} ${ampm}`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex">
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <main className="flex-1 min-w-0">
        <Navbar onMenuClick={() => setSidebarOpen(true)} />

        <div className="p-4 lg:p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Reminders</h1>
              <p className="text-muted">Stay consistent with smart reminders</p>
            </div>

            <button
              onClick={() => setModalOpen(true)}
              className="px-4 py-3 bg-primary text-white rounded-xl flex items-center gap-2 hover:bg-primary-hover shadow-lg"
            >
              <Plus className="w-5 h-5" />
              Add Reminder
            </button>
          </div>

          {/* EMPTY */}
          {reminders.length === 0 && (
            <div className="bg-surface rounded-3xl p-12 text-center card-shadow">
              <Bell className="w-16 h-16 mx-auto mb-4 text-primary" />
              <h3 className="text-xl font-semibold">No Reminders Yet</h3>
              <p className="text-muted mt-2 mb-6">
                Create reminders to stay on track.
              </p>
              <button
                onClick={() => setModalOpen(true)}
                className="px-6 py-3 bg-primary text-white rounded-xl"
              >
                Create Reminder
              </button>
            </div>
          )}

          {/* LIST */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {reminders.map((rem) => (
              <div
                key={rem.id}
                className={`bg-surface p-5 rounded-2xl card-shadow transition ${
                  !rem.is_active ? "opacity-60" : ""
                }`}
              >
                <div className="flex justify-between">
                  <div className="flex gap-3">
                    <div className="w-12 h-12 bg-primary-light rounded-xl flex items-center justify-center text-2xl">
                      {rem.habit_icon || "⏰"}
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">
                        {rem.habit_name || "General Reminder"}
                      </h3>
                      <p className="text-sm text-muted flex gap-1 items-center">
                        <Clock className="w-4 h-4" />
                        {formatTime(rem.time)}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => handleDelete(rem.id)}
                    className="p-2 rounded-lg hover:bg-red-50 text-muted hover:text-danger"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {rem.message && (
                  <p className="text-sm text-muted mt-2 line-clamp-2">
                    {rem.message}
                  </p>
                )}

                <div className="flex justify-between mt-4 pt-4 border-t border-border">
                  <span className="text-sm capitalize text-muted">
                    {rem.days}
                  </span>

                  <button
                    onClick={() => handleToggle(rem.id)}
                    className={`px-3 py-1 rounded-full flex items-center gap-2 ${
                      rem.is_active
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-gray-200 text-muted"
                    }`}
                  >
                    {rem.is_active ? (
                      <>
                        <ToggleRight className="w-4 h-4" /> Active
                      </>
                    ) : (
                      <>
                        <ToggleLeft className="w-4 h-4" /> Paused
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* MODAL */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setModalOpen(false)}
          />
          <div className="relative bg-surface rounded-3xl p-6 w-full max-w-md shadow-xl animate-modal-in">
            <div className="flex justify-between mb-6">
              <h2 className="text-xl font-semibold text-foreground">
                New Reminder
              </h2>
              <button
                onClick={() => setModalOpen(false)}
                className="p-2 rounded-xl hover:bg-gray-100"
              >
                <X className="w-5 h-5 text-muted" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Habit */}
              <div>
                <label className="text-sm font-medium text-foreground">
                  Habit (Optional)
                </label>
                <select
                  value={formData.habit}
                  onChange={(e) =>
                    setFormData({ ...formData, habit: e.target.value })
                  }
                  className="w-full px-4 py-3 bg-background border rounded-2xl mt-2"
                >
                  <option value="">General Reminder</option>
                  {habits.map((h) => (
                    <option key={h.id} value={h.id}>
                      {h.icon} {h.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Time */}
              <div>
                <label className="text-sm font-medium">Time</label>
                <input
                  type="time"
                  value={formData.time}
                  onChange={(e) =>
                    setFormData({ ...formData, time: e.target.value })
                  }
                  className="w-full px-4 py-3 bg-background border rounded-2xl mt-2"
                />
              </div>

              {/* Repeat */}
              <div>
                <label className="text-sm font-medium">Repeat</label>
                <select
                  value={formData.days}
                  onChange={(e) => {
                    setFormData({ ...formData, days: e.target.value });
                    setCustomDaysOpen(e.target.value === "custom");
                  }}
                  className="w-full px-4 py-3 bg-background border rounded-2xl mt-2"
                >
                  <option value="everyday">Everyday</option>
                  <option value="weekdays">Weekdays</option>
                  <option value="weekends">Weekends</option>
                  <option value="custom">Custom Days</option>
                </select>

                {/* Custom Day Picker */}
                {customDaysOpen && (
                  <div className="mt-3 grid grid-cols-7 gap-2">
                    {weekDays.map((d) => (
                      <button
                        key={d}
                        type="button"
                        onClick={() => {
                          const exists = formData.custom_days.includes(d);
                          const updated = exists
                            ? formData.custom_days.filter((x) => x !== d)
                            : [...formData.custom_days, d];

                          setFormData({
                            ...formData,
                            custom_days: updated,
                          });
                        }}
                        className={`px-2 py-2 rounded-xl text-sm ${
                          formData.custom_days.includes(d)
                            ? "bg-primary text-white"
                            : "bg-gray-100 text-muted"
                        }`}
                      >
                        {d}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Message */}
              <div>
                <label className="text-sm font-medium">Message</label>
                <input
                  type="text"
                  placeholder="Time for your habit!"
                  value={formData.message}
                  onChange={(e) =>
                    setFormData({ ...formData, message: e.target.value })
                  }
                  className="w-full px-4 py-3 bg-background border rounded-2xl mt-2"
                />
              </div>

              {/* Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="w-1/2 py-3 bg-gray-200 rounded-2xl"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isSaving}
                  className="w-1/2 py-3 bg-primary text-white rounded-2xl flex items-center justify-center gap-2"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save Reminder"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
