// ====================================================
// BASE CONFIG
// ====================================================
const BASE_URL = "http://127.0.0.1:8000/api";

const authHeader = () => {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Token ${token}` } : {};
};

// ====================================================
// AUTH API
// ====================================================
export const authApi = {

  // ⭐ FIXED LOGIN — accepts a single payload object
  login: async (payload) => {
    try {
      const res = await fetch(`${BASE_URL}/login/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),   // IMPORTANT FIX
      });

      return await res.json();
    } catch {
      return { success: false, error: "Network error." };
    }
  },

  // SIGNUP
  signup: async (name, email, password) => {
    try {
      const username = email.split("@")[0];

      const res = await fetch(`${BASE_URL}/register/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username,
          email,
          password,
          password2: password,
          name,
        }),
      });

      return await res.json();
    } catch {
      return { success: false, error: "Network error." };
    }
  },

  // GET PROFILE
  getProfile: async () => {
    const res = await fetch(`${BASE_URL}/profile/`, {
      headers: authHeader(),
    });
    return res.json();
  },

  // UPDATE PROFILE
  updateProfile: async (data) => {
    const formData = new FormData();
    if (data.name) formData.append("name", data.name);
    if (data.email) formData.append("email", data.email);

    const res = await fetch(`${BASE_URL}/profile/`, {
      method: "PATCH",
      headers: authHeader(),  // DO NOT SET Content-Type
      body: formData,
    });

    return res.json();
  },

  // UPDATE AVATAR
  updateAvatar: async (file) => {
    const fd = new FormData();
    fd.append("avatar", file);

    const res = await fetch(`${BASE_URL}/profile/`, {
      method: "PATCH",
      headers: authHeader(),
      body: fd,
    });

    return res.json();
  },

  // LOGOUT
  logout: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    localStorage.removeItem("email");
    localStorage.removeItem("avatar_url");
  },

  isLoggedIn: () => Boolean(localStorage.getItem("token")),
};

// ====================================================
// HABIT API
// ====================================================
export const habitApi = {
  getAll: async () => {
    const res = await fetch(`${BASE_URL}/habits/`, {
      headers: authHeader(),
    });
    return res.json();
  },

  createForm: async (formData) => {
    const res = await fetch(`${BASE_URL}/habits/`, {
      method: "POST",
      headers: authHeader(),
      body: formData,
    });
    return res.json();
  },

  updateForm: async (id, formData) => {
    const res = await fetch(`${BASE_URL}/habits/${id}/`, {
      method: "PATCH",
      headers: authHeader(),
      body: formData,
    });
    return res.json();
  },

  delete: async (id) => {
    await fetch(`${BASE_URL}/habits/${id}/`, {
      method: "DELETE",
      headers: authHeader(),
    });
    return true;
  },

  toggleCompletion: async (id) => {
    const today = new Date().toISOString().split("T")[0];

    const res = await fetch(
      `${BASE_URL}/habits/${id}/toggle_completion/`,
      {
        method: "POST",
        headers: { ...authHeader(), "Content-Type": "application/json" },
        body: JSON.stringify({ date: today }),
      }
    );

    return res.json();
  },

  getAllCompletions: async () => {
    const res = await fetch(`${BASE_URL}/habits/completions/`, {
      headers: authHeader(),
    });
    return res.json();
  },
};

// ====================================================
// REMINDER API
// ====================================================
export const reminderApi = {
  getAll: async () => {
    const res = await fetch(`${BASE_URL}/reminders/`, {
      headers: authHeader(),
    });
    return res.json();
  },

  create: async (reminder) => {
    const res = await fetch(`${BASE_URL}/reminders/`, {
      method: "POST",
      headers: { ...authHeader(), "Content-Type": "application/json" },
      body: JSON.stringify(reminder),
    });
    return res.json();
  },

  update: async (id, updates) => {
    const res = await fetch(`${BASE_URL}/reminders/${id}/`, {
      method: "PATCH",
      headers: { ...authHeader(), "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    });
    return res.json();
  },

  delete: async (id) => {
    await fetch(`${BASE_URL}/reminders/${id}/`, {
      method: "DELETE",
      headers: authHeader(),
    });
    return true;
  },
};

// ====================================================
// AI SUGGESTIONS
// ====================================================
export const aiSuggestions = {
  get: async () => {
    const res = await fetch(`${BASE_URL}/ai-suggestions/`, {
      headers: authHeader(),
    });
    return res.json();
  },
};
