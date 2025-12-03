import { createContext, useContext, useState, useEffect } from "react";
import { authApi } from "../utils/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // ===================================================================
  // LOAD USER AFTER PAGE REFRESH (TOKENS + AVATAR + PROFILE)
  // ===================================================================
  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setIsLoading(false);
        return;
      }

      try {
        const profile = await authApi.getProfile();
        // authApi.getProfile should return the profile object or an error-like object with .detail

        if (profile && !profile.detail) {
          const avatarUrl =
            profile.avatar_url ||
            profile.avatar ||
            localStorage.getItem("avatar_url") ||
            null;

          setUser({
            id: profile.id,
            email: profile.email,
            name: profile.name || profile.first_name || profile.username,
            username: profile.username || profile.name || profile.email,
            avatar_url: avatarUrl,
            createdAt: profile.createdAt || profile.created_at || profile.date_joined || null,
          });

          // Persist values
          if (profile.name) localStorage.setItem("username", profile.name);
          if (profile.email) localStorage.setItem("email", profile.email);
          if (avatarUrl) localStorage.setItem("avatar_url", avatarUrl);
        }
      } catch (err) {
        // silent fail — token might be invalid
        console.error("Failed to load profile:", err);
      } finally {
        setIsLoading(false);
      }
    };

    loadUser();
  }, []);

  // ===================================================================
  // LOGIN — accepts either (email, password) OR (payloadObject)
  // Examples:
  //   login("me@example.com", "pass")
  //   login({ email: "me@example.com", password: "pass" })
  //   login({ username: "me", password: "pass" })
  // ===================================================================
  const login = async (arg1, arg2) => {
    // Build payload
    let payload;
    if (typeof arg1 === "object" && arg1 !== null) {
      payload = arg1; // payload object passed directly
    } else {
      // assume (emailOrUsername, password)
      const identifier = arg1;
      const password = arg2;
      if (!identifier || !password) {
        return { success: false, error: "Missing credentials" };
      }
      payload = identifier.includes("@")
        ? { email: identifier, password }
        : { username: identifier, password };
    }

    try {
      const result = await authApi.login(payload);

      // backend may return token in different fields; handle gracefully
      const token =
        result?.token || result?.key || result?.auth_token || result?.data?.token;

      if (!token) {
        // If backend returns { success: false, error: "..."} or { detail: ... }
        return { success: false, error: result.error || result.detail || "Invalid login" };
      }

      // Persist token
      localStorage.setItem("token", token);

      // Refresh profile using new token
      const profile = await authApi.getProfile();

      if (!profile || profile?.detail) {
        // If profile failed after login, clear the token and return error
        localStorage.removeItem("token");
        return { success: false, error: "Failed to load profile after login" };
      }

      const avatarUrl = profile.avatar_url || profile.avatar || null;

      const finalUser = {
        id: profile.id,
        email: profile.email,
        name: profile.name || profile.first_name || profile.username,
        username: profile.username || profile.name || profile.email,
        avatar_url: avatarUrl,
        createdAt: profile.createdAt || profile.created_at || profile.date_joined || null,
      };

      setUser(finalUser);

      // Persist profile values
      if (finalUser.username) localStorage.setItem("username", finalUser.username);
      if (finalUser.email) localStorage.setItem("email", finalUser.email);
      if (avatarUrl) localStorage.setItem("avatar_url", avatarUrl);

      return { success: true };
    } catch (err) {
      console.error("Login error:", err);
      return { success: false, error: err?.message || "Network error" };
    }
  };

  // ===================================================================
  // SIGNUP
  // ===================================================================
  const signup = async (name, email, password) => {
    try {
      return await authApi.signup(name, email, password);
    } catch (err) {
      return { success: false, error: err?.message || "Signup failed" };
    }
  };

  // ===================================================================
  // UPDATE PROFILE (NAME + EMAIL)
  // ===================================================================
  const updateProfile = async (updates) => {
    try {
      const result = await authApi.updateProfile(updates);

      if (!result?.detail) {
        setUser((prev) => ({
          ...prev,
          name: result.name || prev.name,
          username: result.name || prev.username,
          email: result.email || prev.email,
        }));

        localStorage.setItem("username", result.name || user?.name || "");
        localStorage.setItem("email", result.email || user?.email || "");
      }

      return result;
    } catch (err) {
      return { success: false, error: err?.message || "Update failed" };
    }
  };

  // ===================================================================
  // UPDATE AVATAR — Save to backend + refresh UI
  // ===================================================================
  const updateAvatar = async (file) => {
    try {
      const result = await authApi.updateAvatar(file);

      const avatar_url = result?.avatar_url || result?.avatar || null;
      if (avatar_url) {
        setUser((prev) => ({
          ...prev,
          avatar_url,
        }));
        localStorage.setItem("avatar_url", avatar_url);
      }

      return result;
    } catch (err) {
      return { success: false, error: err?.message || "Avatar update failed" };
    }
  };

  // ===================================================================
  // LOGOUT — Clear everything
  // ===================================================================
  const logout = () => {
    try {
      authApi.logout(); // best-effort server call
    } catch (err) {
      // ignore
    }

    setUser(null);
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    localStorage.removeItem("email");
    localStorage.removeItem("avatar_url");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        signup,
        logout,
        updateProfile,
        updateAvatar,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
