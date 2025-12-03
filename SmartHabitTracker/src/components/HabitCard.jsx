import {
  Check,
  Flame,
  MoreVertical,
  Trash2,
  Edit,
  TrendingUp,
  Star,
  Zap,
} from "lucide-react";
import { useState } from "react";

const colorMap = {
  orange: "from-orange-400 to-orange-600",
  green: "from-emerald-400 to-emerald-600",
  blue: "from-blue-400 to-blue-600",
  purple: "from-purple-400 to-purple-600",
  pink: "from-pink-400 to-pink-600",
  teal: "from-teal-400 to-teal-600",
  indigo: "from-indigo-400 to-indigo-600",
  rose: "from-rose-400 to-rose-600",
};

const difficultyColors = {
  easy: "bg-emerald-100 text-emerald-700",
  medium: "bg-amber-100 text-amber-700",
  hard: "bg-red-100 text-red-700",
};

export default function HabitCard({
  habit = {},
  isCompleted = false,
  onToggle = () => {},
  onEdit = () => {},
  onDelete = () => {},
}) {
  const [showMenu, setShowMenu] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  // Safe values
  const id = habit.id;
  const name = habit.name || "Habit";
  const description = habit.description || "";
  const color = habit.color || "orange";
  const streak = habit.streak || 0;
  const totalCompletions = habit.totalCompletions || 0;
  const difficulty = habit.difficulty || "medium";
  const target = habit.target || "Daily";
  const icon = habit.icon || "🎯";

  // ============================
  // 🖼 FIXED IMAGE LOGIC
  // ============================
  let image = null;

  if (habit.image) {
    if (habit.image.startsWith("data:")) {
      image = habit.image; // base64
    } else if (habit.image.startsWith("/media/")) {
      image = `http://127.0.0.1:8000${habit.image}`; // Django media
    } else if (habit.image.startsWith("http")) {
      image = habit.image; // direct URL
    }
  }

  const gradientClass = colorMap[color] || colorMap.orange;

  const handleToggle = () => {
    setIsAnimating(true);
    setTimeout(() => setIsAnimating(false), 600);
    onToggle(id);
  };

  // Milestones
  const milestone =
    streak >= 100
      ? { icon: "👑", label: "Legend" }
      : streak >= 50
      ? { icon: "💎", label: "Diamond" }
      : streak >= 30
      ? { icon: "🏆", label: "Champion" }
      : streak >= 14
      ? { icon: "⭐", label: "Star" }
      : streak >= 7
      ? { icon: "🔥", label: "On Fire" }
      : null;

  return (
    <div
      className={`relative rounded-3xl transition-all duration-500 overflow-hidden group ${
        isCompleted
          ? "bg-surface-dark text-white shadow-2xl scale-[0.98]"
          : "bg-surface shadow-lg hover:shadow-2xl hover:scale-[1.02]"
      } ${isAnimating ? "animate-celebrate" : ""}`}
    >
      {/* ================= IMAGE ================ */}
      {image && (
        <div className="relative h-32 overflow-hidden">
          <img
            src={image}
            alt={name}
            className={`w-full h-full object-cover transition-all duration-500 ${
              isCompleted ? "opacity-40 grayscale" : "group-hover:scale-110"
            }`}
          />
          <div
            className={`absolute inset-0 bg-gradient-to-t ${
              isCompleted
                ? "from-surface-dark via-surface-dark/80"
                : "from-black/60 via-transparent"
            }`}
          />
        </div>
      )}

      {/* ================= CONTENT ================ */}
      <div className={`p-5 ${image ? "pt-3" : ""}`}>
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            {/* ICON */}
            {!image ? (
              <div
                className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl transition-all duration-300 ${
                  isCompleted
                    ? "bg-white/20"
                    : `bg-gradient-to-br ${gradientClass} shadow-lg`
                } ${isAnimating ? "animate-bounce" : ""}`}
              >
                {icon}
              </div>
            ) : (
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl ${
                  isCompleted
                    ? "bg-white/20"
                    : `bg-gradient-to-br ${gradientClass}`
                }`}
              >
                {icon}
              </div>
            )}

            {/* MILESTONE BADGE */}
            {milestone && (
              <div
                className={`px-2 py-1 rounded-lg text-xs font-medium flex items-center gap-1 ${
                  isCompleted
                    ? "bg-white/20 text-white"
                    : "bg-amber-100 text-amber-700"
                }`}
              >
                <span>{milestone.icon}</span>
                <span>{milestone.label}</span>
              </div>
            )}
          </div>

          {/* MENU BUTTON */}
          <div className="relative">
            <button
              onClick={() => setShowMenu((prev) => !prev)}
              className={`p-2 rounded-xl transition-colors ${
                isCompleted ? "hover:bg-white/10" : "hover:bg-gray-100"
              }`}
            >
              <MoreVertical className="w-5 h-5" />
            </button>

            {showMenu && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setShowMenu(false)}
                />

                <div className="absolute right-0 top-full mt-2 bg-surface rounded-xl shadow-xl py-2 min-w-[160px] border z-20">
                  <button
                    onClick={() => {
                      onEdit(habit);
                      setShowMenu(false);
                    }}
                    className="flex items-center gap-3 w-full px-4 py-3 text-foreground hover:bg-gray-50"
                  >
                    <Edit className="w-4 h-4" />
                    Edit Habit
                  </button>

                  <button
                    onClick={() => {
                      onDelete(id);
                      setShowMenu(false);
                    }}
                    className="flex items-center gap-3 w-full px-4 py-3 text-danger hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* NAME + DESC */}
        <h3
          className={`font-bold text-lg mb-1 ${
            isCompleted ? "text-white" : "text-foreground"
          }`}
        >
          {name}
        </h3>
        <p
          className={`text-sm mb-4 line-clamp-2 ${
            isCompleted ? "text-white/70" : "text-muted"
          }`}
        >
          {description || target}
        </p>

        {/* TAGS */}
        <div className="flex flex-wrap items-center gap-2 mb-4">
          {/* difficulty */}
          <div
            className={`px-3 py-1 rounded-full text-xs font-medium ${
              isCompleted ? "bg-white/20 text-white" : difficultyColors[difficulty]
            }`}
          >
            {difficulty === "easy" && (
              <Zap className="w-3 h-3 inline mr-1" />
            )}
            {difficulty[0].toUpperCase() + difficulty.slice(1)}
          </div>

          {/* target */}
          <div
            className={`px-3 py-1 rounded-full text-xs font-medium ${
              isCompleted ? "bg-white/20 text-white" : "bg-gray-100 text-muted"
            }`}
          >
            {target}
          </div>

          {/* completions */}
          {totalCompletions > 0 && (
            <div
              className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${
                isCompleted
                  ? "bg-white/20 text-white"
                  : "bg-purple-100 text-purple-700"
              }`}
            >
              <Star className="w-3 h-3" />
              {totalCompletions} done
            </div>
          )}
        </div>

        {/* FOOTER */}
        <div className="flex items-center justify-between">
          {/* streak */}
          <div className="flex items-center gap-2">
            {streak > 0 ? (
              <div
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold ${
                  isCompleted
                    ? "bg-orange-500/30 text-white"
                    : "bg-orange-100 text-orange-600"
                }`}
              >
                <Flame
                  className={`w-5 h-5 ${
                    streak >= 7 ? "animate-pulse" : ""
                  }`}
                />
                <span>{streak} day streak</span>
              </div>
            ) : (
              <div
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm ${
                  isCompleted ? "bg-white/10 text-white/70" : "bg-gray-100 text-muted"
                }`}
              >
                <TrendingUp className="w-4 h-4" />
                Build your streak
              </div>
            )}
          </div>

          {/* toggle button */}
          <button
            onClick={handleToggle}
            className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-300 ${
              isCompleted
                ? "bg-white text-surface-dark shadow-inner"
                : `bg-gradient-to-br ${gradientClass} text-white shadow-lg hover:shadow-xl hover:scale-110 active:scale-95`
            }`}
          >
            <Check className={`w-7 h-7 ${isCompleted ? "scale-110" : ""}`} />
          </button>
        </div>
      </div>

      {/* DONE BADGE */}
      {isCompleted && (
        <div className="absolute top-3 right-16 flex items-center gap-1 px-3 py-1 bg-emerald-500 text-white rounded-full text-xs font-medium">
          <Check className="w-3 h-3" />
          Done today
        </div>
      )}
    </div>
  );
}
