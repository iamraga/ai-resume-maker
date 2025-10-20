import { create } from "zustand";
import { produce } from "immer";
import { createEmptyResume } from "@/lib/models/resume";

export const useResumeStore = create((set, get) => ({
  resume: createEmptyResume(),
  activeSection: "basics",
  setResume(resume) {
    set({ resume: { ...resume }, activeSection: "basics" });
  },
  setActiveSection(section) {
    set({ activeSection: section });
  },
  updateSection(section, updater) {
    set(
      produce((state) => {
        if (typeof updater === "function") {
          state.resume[section] = updater(state.resume[section]);
        } else {
          state.resume[section] = updater;
        }
        state.resume.updatedAt = new Date().toISOString();
      })
    );
  },
  applySuggestion(section, payload) {
    set(
      produce((state) => {
        state.resume[section] = payload;
        state.resume.updatedAt = new Date().toISOString();
      })
    );
  },
  reset() {
    set({ resume: createEmptyResume(), activeSection: "basics" });
  },
}));
