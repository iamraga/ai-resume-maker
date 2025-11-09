import { create } from "zustand";

export const useAuthModalStore = create((set) => ({
  open: false,
  openModal: () => set({ open: true }),
  closeModal: () => set({ open: false }),
}));
