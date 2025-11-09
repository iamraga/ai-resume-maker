"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Download, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChatPanel } from "@/components/editor/chat-panel";
import { ResumePreview } from "@/components/editor/resume-preview";
import { SectionEditor } from "@/components/editor/section-editor";
import { Button } from "@/components/ui/button";
import { useResumeStore } from "@/lib/state/resume-store";
import { useAuthStore } from "@/lib/state/auth-store";
import { updateResumeContent } from "@/lib/services/resume-service";
import { auth } from "@/lib/firebase/client";
import { toast } from "sonner";

export function EditorShell({ resumeId }) {
  const resume = useResumeStore((state) => state.resume);
  const setSaving = useResumeStore((state) => state.setSaving);
  const setLastSavedAt = useResumeStore((state) => state.setLastSavedAt);
  const lastSyncedContent = useResumeStore((state) => state.lastSyncedContent);
  const setLastSyncedContent = useResumeStore((state) => state.setLastSyncedContent);
  const userId = useAuthStore((state) => state.user?.uid ?? null);
  const [exporting, setExporting] = useState(false);
  const [previewCollapsed, setPreviewCollapsed] = useState(true);
  const contentStringRef = useRef(null);

  const contentSnapshot = useMemo(
    () => ({
      basics: resume.basics,
      experience: resume.experience,
      education: resume.education,
      skills: resume.skills,
      projects: resume.projects,
      status: resume.status,
    }),
    [
      resume.basics,
      resume.education,
      resume.experience,
      resume.projects,
      resume.skills,
      resume.status,
    ]
  );

  const contentString = useMemo(
    () => JSON.stringify(contentSnapshot),
    [contentSnapshot]
  );

  useEffect(() => {
    contentStringRef.current = contentString;
  }, [contentString]);

  useEffect(() => {
    if (resume.id && !lastSyncedContent) {
      setLastSyncedContent(contentString);
    }
  }, [contentString, lastSyncedContent, resume.id, setLastSyncedContent]);

  const saveMutation = useMutation({
    mutationFn: async (payload) => {
      if (!userId || !resume.id) {
        throw new Error("Missing resume context.");
      }
      return updateResumeContent(userId, resume.id, payload);
    },
    onMutate: () => {
      setSaving(true);
    },
    onError: (error) => {
      console.error("Failed to save resume content", error);
      toast.error("Unable to save changes. They will retry shortly.");
    },
    onSuccess: () => {
      const now = new Date().toISOString();
      setLastSavedAt(now);
      setLastSyncedContent(contentStringRef.current);
    },
    onSettled: () => {
      setSaving(false);
    },
  });

  useEffect(() => {
    if (!resume.id || !userId) {
      return;
    }
    if (!lastSyncedContent) {
      return;
    }
    if (contentString === lastSyncedContent) {
      return;
    }
    const timeout = setTimeout(() => {
      saveMutation.mutate(contentSnapshot);
    }, 600);
    return () => clearTimeout(timeout);
  }, [
    contentSnapshot,
    contentString,
    lastSyncedContent,
    resume.id,
    saveMutation,
    userId,
  ]);

  async function handleExport() {
    if (!resumeId) {
      toast.error("Please open a resume before exporting.");
      return;
    }

    try {
      setExporting(true);
      const currentUser = auth.currentUser;
      if (!currentUser) {
        throw new Error("User session expired. Please sign in again.");
      }
      const token = await currentUser.getIdToken();
      const response = await fetch(`/api/resumes/${resumeId}/export`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => null);
        const message = payload?.error || "Export failed. Please try again.";
        throw new Error(message);
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      const safeName =
        resume.basics.fullName?.toLowerCase().replace(/\s+/g, "-") || "resume";
      anchor.href = url;
      anchor.download = `${safeName}-${resumeId}.pdf`;
      document.body.appendChild(anchor);
      anchor.click();
      document.body.removeChild(anchor);
      URL.revokeObjectURL(url);
      toast.success("Export ready.");
    } catch (error) {
      console.error("Failed to export resume", error);
      toast.error(error.message || "Export failed. Please try again.");
    } finally {
      setExporting(false);
    }
  }

  return (
    <div className="flex flex-col gap-6 py-8">
      <div className="grid gap-6 lg:grid-cols-[minmax(320px,420px)_minmax(0,1fr)]">
        <Card className="flex-1">
          <CardHeader>
            <CardTitle className="text-base font-semibold">
              Resume sections
            </CardTitle>
          </CardHeader>
          <CardContent>
            <SectionEditor />
          </CardContent>
        </Card>
        <ChatPanel
          resumeId={resumeId}
          className="h-[50vh] max-h-[50vh] min-h-[320px]"
        />
      </div>

      <div className="rounded-xl border bg-card">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b px-4 py-3">
          <div>
            <p className="text-sm font-medium text-foreground">Live preview</p>
            <p className="text-xs text-muted-foreground">
              See how your resume looks as you edit.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setPreviewCollapsed((prev) => !prev)}
            >
              {previewCollapsed ? "Show preview" : "Hide preview"}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleExport}
              disabled={exporting || !resumeId}
              className="inline-flex items-center gap-2"
            >
              {exporting ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Exporting…
                </>
              ) : (
                <>
                  <Download className="size-4" />
                  Export PDF
                </>
              )}
            </Button>
          </div>
        </div>
        {previewCollapsed ? (
          <div className="px-4 py-6 text-sm text-muted-foreground">
            Preview hidden. Expand whenever you want to audit the layout.
          </div>
        ) : (
          <div className="p-4">
            <ResumePreview bare className="min-h-[360px]" />
          </div>
        )}
      </div>
    </div>
  );
}
