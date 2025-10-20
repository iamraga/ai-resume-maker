import { create } from "zustand";

export const useAuthStore = create((set) => ({
  user: null,
  loading: true,
  error: null,
  setUser(user) {
    set({ user, loading: false, error: null });
  },
  setLoading(loading) {
    set({ loading });
  },
  setError(error) {
    set({ error, loading: false });
  },
  reset() {
    set({ user: null, loading: false, error: null });
  },
}));
