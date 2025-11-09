"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Loader2, UploadCloud, ArrowUpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EditorShell } from "@/components/editor/editor-shell";
import { fetchUserResumeById } from "@/lib/services/resume-service";
import { useAuthStore } from "@/lib/state/auth-store";
import { useResumeStore } from "@/lib/state/resume-store";
import { auth } from "@/lib/firebase/client";
import { toast } from "sonner";

function formatDateString(value) {
  if (!value) {
    return "Just now";
  }
  const date =
    typeof value === "string" || typeof value === "number"
      ? new Date(value)
      : value;
  if (Number.isNaN(date?.getTime?.())) {
    return "Just now";
  }
  try {
    return date.toLocaleDateString(undefined, {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return "Just now";
  }
}

function formatFileSize(bytes) {
  if (!bytes) return "0 KB";
  const units = ["B", "KB", "MB", "GB"];
  const exponent =
    bytes === 0 ? 0 : Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  const size = bytes / Math.pow(1024, exponent);
  return `${size.toFixed(exponent === 0 ? 0 : 1)} ${units[exponent]}`;
}

export function ResumeEditorView({ resumeId }) {
  const user = useAuthStore((state) => state.user);
  const userId = user?.uid ?? null;
  const router = useRouter();
  const setResumeFromFirestore = useResumeStore(
    (state) => state.setResumeFromFirestore
  );
  const editorResume = useResumeStore((state) => state.resume);
  const saving = useResumeStore((state) => state.saving);
  const lastSavedAt = useResumeStore((state) => state.lastSavedAt);
  const setFileMetadata = useResumeStore((state) => state.setFileMetadata);
  const queryClient = useQueryClient();
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  const {
    data: resume,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["resume", userId, resumeId],
    queryFn: () => fetchUserResumeById(userId, resumeId),
    enabled: Boolean(userId && resumeId),
    retry: false,
  });

  useEffect(() => {
    if (resume) {
      setResumeFromFirestore(resume);
    }
  }, [resume, setResumeFromFirestore]);

  const createdOn = useMemo(() => {
    const source =
      resume?.createdAt ||
      editorResume?.createdAt ||
      resume?.updatedAt ||
      editorResume?.updatedAt ||
      null;
    return formatDateString(source);
  }, [
    editorResume?.createdAt,
    editorResume?.updatedAt,
    resume?.createdAt,
    resume?.updatedAt,
  ]);

  const title = editorResume?.title || resume?.title || "Untitled";

  const saveStatus = useMemo(() => {
    if (saving) {
      return "Saving changes…";
    }
    if (lastSavedAt) {
      return `Last saved ${formatDateString(lastSavedAt)}`;
    }
    return "Changes are saved automatically.";
  }, [lastSavedAt, saving]);

  function handleBack() {
    router.push("/dashboard");
  }

  async function handleFileUpload(file) {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        throw new Error("User session expired. Please sign in again.");
      }
      const token = await currentUser.getIdToken();
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch(`/api/resumes/${resumeId}/upload`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorPayload = await response.json().catch(() => null);
        const message =
          errorPayload?.error || "Upload failed. Please try again later.";
        throw new Error(message);
      }

      const result = await response.json();
      setFileMetadata({
        fileName: result.fileName,
        fileType: result.fileType,
        fileSize: result.fileSize,
        fileURL: result.fileURL || "",
        filePath: result.filePath || "",
        parsedText: result.parsedText || "",
        uploadedAt: result.uploadedAt || new Date().toISOString(),
        updatedAt: result.updatedAt || new Date().toISOString(),
      });
      toast.success("Resume uploaded successfully.");
      queryClient.invalidateQueries({ queryKey: ["resume", userId, resumeId] });
      queryClient.invalidateQueries({ queryKey: ["resumes", userId] });
    } catch (error) {
      console.error("Failed to upload resume", error);
      toast.error(error.message || "Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  }

  function handleFileChange(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!editorResume.id || !userId) {
      toast.error("You need to open a resume before uploading.");
      event.target.value = "";
      return;
    }
    if (file.type !== "application/pdf") {
      toast.error("Unsupported file type. Please upload a PDF file.");
      event.target.value = "";
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File is too large. Please upload a file under 5MB.");
      event.target.value = "";
      return;
    }
    setUploading(true);
    void handleFileUpload(file).finally(() => {
      event.target.value = "";
    });
  }

  function handleTriggerUpload() {
    fileInputRef.current?.click();
  }

  return (
    <div className="min-h-screen bg-background px-6 pb-10">
      <header className="mx-auto flex w-full max-w-6xl flex-col gap-4 py-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              onClick={handleBack}
              className="inline-flex h-8 w-8 items-center justify-center rounded-full px-0 text-primary hover:text-primary"
              title="Back to dashboard"
            >
              <ArrowLeft className="size-4" />
            </Button>
            <div>
              <p className="text-sm text-muted-foreground">Editing</p>
              <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
                {isLoading ? "Loading resume..." : title}
              </h1>
            </div>
          </div>
          <div className="text-right text-xs text-muted-foreground">
            <p>
              {isLoading
                ? "Fetching your workspace..."
                : `Created on ${createdOn}`}
            </p>
            <p>{saveStatus}</p>
          </div>
        </div>
        <div className="rounded-xl border bg-card px-4 py-3">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Uploaded resume
              </p>
              {editorResume.fileName ? (
                <>
                  <p className="text-sm font-medium text-foreground">
                    {editorResume.fileName}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatFileSize(editorResume.fileSize)} ·{" "}
                    {formatDateString(editorResume.uploadedAt) ||
                      "Uploaded just now"}
                  </p>
                </>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No PDF linked yet. Upload one to give the assistant more context.
                </p>
              )}
            </div>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <Button
                variant="outline"
                className="inline-flex items-center justify-center gap-2"
                onClick={handleTriggerUpload}
                disabled={uploading}
              >
                {uploading ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : editorResume.fileName ? (
                  <ArrowUpCircle className="size-4" />
                ) : (
                  <UploadCloud className="size-4" />
                )}
                {uploading
                  ? "Uploading..."
                  : editorResume.fileName
                  ? "Replace file"
                  : "Upload PDF"}
              </Button>
              <p className="text-xs text-muted-foreground sm:ml-2">
                PDF only · Max size 5 MB
              </p>
            </div>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf"
            className="hidden"
            onChange={handleFileChange}
          />
        </div>
        {isError ? (
          <div className="rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
            {error?.message || "Unable to load this resume."}
          </div>
        ) : null}
      </header>
      <main className="mx-auto max-w-6xl">
        {isLoading ? (
          <div className="flex min-h-[300px] flex-col items-center justify-center gap-3 text-sm text-muted-foreground">
            <Loader2 className="size-6 animate-spin" />
            Preparing your editor...
          </div>
        ) : isError || !resume ? (
          <div className="flex min-h-[300px] flex-col items-center justify-center gap-3 text-sm text-muted-foreground">
            Something went wrong while loading this resume.
            <Button onClick={handleBack} variant="outline" className="mt-2">
              Back to dashboard
            </Button>
          </div>
        ) : (
          <EditorShell resumeId={resumeId} />
        )}
      </main>
    </div>
  );
}
