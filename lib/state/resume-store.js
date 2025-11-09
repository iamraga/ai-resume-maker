import { create } from "zustand";
import { produce } from "immer";
import { createEmptyResume } from "@/lib/models/resume";

export const useResumeStore = create((set, get) => ({
  resume: createEmptyResume(),
  activeSection: "basics",
  saving: false,
  lastSavedAt: null,
  lastSyncedContent: null,
  setResume(resume) {
    set({ resume: { ...resume }, activeSection: "basics" });
  },
  setResumeFromFirestore(resumeData) {
    const normalized = createEmptyResume({
      ...resumeData.content,
      title: resumeData.title,
      ownerId: resumeData.ownerId,
      fileURL: resumeData.fileURL || "",
      fileName: resumeData.fileName || "",
      fileType: resumeData.fileType || "",
      fileSize: resumeData.fileSize || 0,
      filePath: resumeData.filePath || "",
      parsedText: resumeData.parsedText || "",
      uploadedAt: resumeData.uploadedAt || null,
      createdAt: resumeData.createdAt || new Date().toISOString(),
      updatedAt: resumeData.updatedAt || new Date().toISOString(),
      status: resumeData.status || "draft",
    });
    normalized.id = resumeData.id;

    set({
      resume: normalized,
      activeSection: "basics",
      saving: false,
      lastSavedAt: resumeData.updatedAt || null,
      lastSyncedContent: JSON.stringify({
        basics: normalized.basics,
        experience: normalized.experience,
        education: normalized.education,
        skills: normalized.skills,
        projects: normalized.projects,
        status: normalized.status,
      }),
    });
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
  updateResumeFields(updater) {
    set(
      produce((state) => {
        const result =
          typeof updater === "function" ? updater(state.resume) : updater;
        state.resume = {
          ...state.resume,
          ...result,
        };
        state.resume.updatedAt = new Date().toISOString();
      })
    );
  },
  setFileMetadata(metadata) {
    set(
      produce((state) => {
        state.resume.fileName = metadata.fileName || "";
        state.resume.fileType = metadata.fileType || "";
        state.resume.fileSize =
          typeof metadata.fileSize === "number" ? metadata.fileSize : 0;
        state.resume.fileURL = metadata.fileURL || "";
        state.resume.filePath = metadata.filePath || "";
        state.resume.parsedText =
          typeof metadata.parsedText === "string"
            ? metadata.parsedText
            : state.resume.parsedText;
        state.resume.uploadedAt = metadata.uploadedAt || null;
        state.resume.updatedAt = metadata.updatedAt || new Date().toISOString();
      })
    );
  },
  setSaving(saving) {
    set({ saving });
  },
  setLastSavedAt(timestamp) {
    set({ lastSavedAt: timestamp });
  },
  setLastSyncedContent(snapshot) {
    set({ lastSyncedContent: snapshot });
  },
  reset() {
    set({
      resume: createEmptyResume(),
      activeSection: "basics",
      saving: false,
      lastSavedAt: null,
      lastSyncedContent: null,
    });
  },
}));
