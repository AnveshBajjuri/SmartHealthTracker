import { useState, useEffect, useRef } from "react";
import { X, Upload, Sparkles } from "lucide-react";

const colors = [
  { name: "orange", class: "bg-gradient-to-br from-orange-400 to-orange-600", light: "bg-orange-50" },
  { name: "green", class: "bg-gradient-to-br from-emerald-400 to-emerald-600", light: "bg-emerald-50" },
  { name: "blue", class: "bg-gradient-to-br from-blue-400 to-blue-600", light: "bg-blue-50" },
  { name: "purple", class: "bg-gradient-to-br from-purple-400 to-purple-600", light: "bg-purple-50" },
  { name: "pink", class: "bg-gradient-to-br from-pink-400 to-pink-600", light: "bg-pink-50" },
  { name: "teal", class: "bg-gradient-to-br from-teal-400 to-teal-600", light: "bg-teal-50" },
  { name: "indigo", class: "bg-gradient-to-br from-indigo-400 to-indigo-600", light: "bg-indigo-50" },
  { name: "rose", class: "bg-gradient-to-br from-rose-400 to-rose-600", light: "bg-rose-50" }
];

const icons = ["🎯", "💪", "📚", "🏃", "💧", "🧘", "✍️", "🎨", "🎵", "💤", "🥗", "🧠", "🚀", "💼", "🎮", "🌱"];

const categories = [
  { value: "health", label: "Health & Fitness", emoji: "💪" },
  { value: "productivity", label: "Productivity", emoji: "📈" },
  { value: "learning", label: "Learning", emoji: "📚" },
  { value: "mindfulness", label: "Mindfulness", emoji: "🧘" },
  { value: "social", label: "Social", emoji: "👥" },
  { value: "creative", label: "Creative", emoji: "🎨" },
  { value: "finance", label: "Finance", emoji: "💰" },
  { value: "other", label: "Other", emoji: "✨" }
];

export default function AddHabitModal({ isOpen, onClose, onSave, editingHabit }) {
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    color: "orange",
    icon: "🎯",
    target: "Daily",
    category: "health",
    difficulty: "medium",
    image_file: null,
    image_url: null
  });

  useEffect(() => {
    if (editingHabit) {
      const fixedImage =
        editingHabit.image_url?.startsWith("/media/")
          ? `http://127.0.0.1:8000${editingHabit.image_url}`
          : editingHabit.image_url || null;

      setFormData({
        name: editingHabit.name || "",
        description: editingHabit.description || "",
        color: editingHabit.color || "orange",
        icon: editingHabit.icon || "🎯",
        target: editingHabit.target || "Daily",
        category: editingHabit.category || "health",
        difficulty: editingHabit.difficulty || "medium",
        image_file: null,
        image_url: fixedImage
      });
    } else {
      setFormData({
        name: "",
        description: "",
        color: "orange",
        icon: "🎯",
        target: "Daily",
        category: "health",
        difficulty: "medium",
        image_file: null,
        image_url: null
      });
    }
  }, [editingHabit, isOpen]);

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFormData((prev) => ({
      ...prev,
      image_file: file,
      image_url: URL.createObjectURL(file)
    }));
  };

  const removeImage = () => {
    setFormData((prev) => ({
      ...prev,
      image_file: null,
      image_url: null
    }));
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    onSave({
      id: editingHabit?.id,
      name: formData.name,
      description: formData.description,
      target: formData.target,
      color: formData.color,
      icon: formData.icon,
      category: formData.category,
      difficulty: formData.difficulty,
      image_file: formData.image_file
    });

    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={onClose} />

      <div className="relative bg-surface rounded-3xl w-full max-w-2xl shadow-2xl max-h-[90vh] overflow-hidden animate-modal-in">
        
        {/* HEADER */}
        <div className="sticky top-0 bg-surface border-b border-border z-10 p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-orange-400 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-xl font-bold text-foreground">
              {editingHabit ? "Edit Habit" : "Create New Habit"}
            </h2>
          </div>

          <button onClick={onClose} className="p-2 text-muted hover:text-foreground rounded-xl hover:bg-gray-100">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* TABS */}
        <div className="flex gap-1 px-6 pb-4">
          {["basic", "appearance"].map((tab) => (
            <button
              key={tab}
              onClick={() => setFormData((p) => ({ ...p, tab }))}
              className={`px-4 py-2 rounded-xl font-medium ${
                formData.tab === tab ? "bg-primary text-white" : "text-muted hover:bg-gray-100"
              }`}
            >
              {tab[0].toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[calc(90vh-160px)]">
          
          {/* BASIC TAB */}
          {!formData.tab || formData.tab === "basic" ? (
            <div className="space-y-6">

              {/* Name */}
              <div>
                <label className="text-sm font-medium">Habit Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="mt-2 w-full px-4 py-3 bg-background rounded-2xl border"
                  required
                />
              </div>

              {/* Description */}
              <div>
                <label className="text-sm font-medium">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="mt-2 w-full px-4 py-3 bg-background rounded-2xl border"
                />
              </div>

              {/* Category */}
              <div>
                <label className="text-sm font-medium">Category</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-2">
                  {categories.map((cat) => (
                    <button
                      key={cat.value}
                      type="button"
                      onClick={() => setFormData({ ...formData, category: cat.value })}
                      className={`px-3 py-3 rounded-xl text-sm font-medium ${
                        formData.category === cat.value
                          ? "bg-primary text-white shadow-lg"
                          : "bg-background border"
                      }`}
                    >
                      {cat.emoji} {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Difficulty */}
              <div>
                <label className="text-sm font-medium">Difficulty</label>
                <select
                  value={formData.difficulty}
                  onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
                  className="mt-2 w-full px-4 py-3 bg-background rounded-2xl border"
                >
                  <option value="easy">Easy (2–5 min)</option>
                  <option value="medium">Medium (10–20 min)</option>
                  <option value="hard">Hard (30+ min)</option>
                </select>
              </div>
            </div>
          ) : null}

          {/* APPEARANCE TAB */}
          {formData.tab === "appearance" ? (
            <div className="space-y-6">

              {/* Image Upload */}
              <div>
                <label className="block text-sm font-medium mb-3">Habit Image</label>

                {formData.image_url ? (
                  <div className="relative w-32 h-32">
                    <img src={formData.image_url} className="w-full h-full rounded-xl object-cover" />

                    <button
                      type="button"
                      onClick={removeImage}
                      className="absolute -top-3 -right-3 w-8 h-8 bg-danger text-white rounded-full flex items-center justify-center"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-32 h-32 border-2 border-dashed rounded-xl flex flex-col items-center justify-center text-muted"
                  >
                    <Upload className="w-8 h-8" />
                    <span className="text-xs">Upload</span>
                  </button>
                )}

                <input ref={fileInputRef} type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
              </div>

              {/* Icons */}
              <div>
                <label className="block text-sm font-medium mb-3">Choose Icon</label>
                <div className="grid grid-cols-8 gap-2">
                  {icons.map((ic) => (
                    <button
                      key={ic}
                      type="button"
                      onClick={() => setFormData({ ...formData, icon: ic })}
                      className={`w-12 h-12 rounded-xl text-2xl ${
                        formData.icon === ic ? "bg-primary text-white" : "bg-background border"
                      }`}
                    >
                      {ic}
                    </button>
                  ))}
                </div>
              </div>

              {/* Color Theme */}
              <div>
                <label className="block text-sm font-medium mb-3">Color Theme</label>

                <div className="grid grid-cols-4 sm:grid-cols-8 gap-3">
                  {colors.map((c) => (
                    <button
                      type="button"
                      key={c.name}
                      onClick={() => setFormData({ ...formData, color: c.name })}
                      className={`w-12 h-12 rounded-xl ${c.class} ${
                        formData.color === c.name ? "ring-4 ring-gray-300 scale-110" : ""
                      }`}
                    />
                  ))}
                </div>

                <div className="mt-4 p-4 bg-background rounded-2xl flex items-center gap-3">
                  <div className="w-14 h-14 rounded-xl flex items-center justify-center text-2xl">
                    {formData.icon}
                  </div>
                  <div>
                    <p className="font-semibold">{formData.name || "Habit Preview"}</p>
                    <p className="text-sm text-muted">{formData.target}</p>
                  </div>
                </div>
              </div>
            </div>
          ) : null}

          {/* FOOTER BUTTONS */}
          <div className="flex gap-3 pt-6 mt-6 border-t border-border">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-4 bg-gray-100 text-foreground rounded-2xl font-medium hover:bg-gray-200"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="flex-1 px-6 py-4 bg-gradient-to-r from-primary to-orange-500 text-white rounded-2xl font-medium shadow-lg hover:scale-[1.03]"
            >
              {editingHabit ? "Save Changes" : "Create Habit"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
