"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Check, Loader2, Pencil, PlusCircle, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useAuthStore } from "@/lib/state/auth-store";
import {
  createUserResume,
  fetchUserResumes,
  deleteUserResume,
  updateUserResumeTitle,
} from "@/lib/services/resume-service";
import { toast } from "sonner";

function formatDate(value) {
  if (!value) {
    return "Just created";
  }
  const parsed =
    typeof value === "string" || typeof value === "number"
      ? new Date(value)
      : value;
  if (Number.isNaN(parsed?.getTime?.())) {
    return "Recently updated";
  }
  try {
    return parsed.toLocaleString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return "Recently updated";
  }
}

export function DashboardShell() {
  const user = useAuthStore((state) => state.user);
  const router = useRouter();
  const queryClient = useQueryClient();
  const [editingResumeId, setEditingResumeId] = useState(null);
  const [titleDraft, setTitleDraft] = useState("");
  const [pendingResumeId, setPendingResumeId] = useState(null);
  const [resumeToDelete, setResumeToDelete] = useState(null);

  const userId = user?.uid ?? null;

  const {
    data: resumes = [],
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["resumes", userId],
    queryFn: () => fetchUserResumes(userId),
    enabled: Boolean(userId),
  });

  const resetEditing = useCallback(() => {
    setEditingResumeId(null);
    setTitleDraft("");
  }, []);

  const createResumeMutation = useMutation({
    mutationFn: async () => {
      if (!userId) {
        throw new Error("User ID is required to create a resume.");
      }
      return createUserResume(userId);
    },
    onSuccess: (newResumeId) => {
      setPendingResumeId(newResumeId);
      queryClient.invalidateQueries({ queryKey: ["resumes", userId] });
      router.push(`/resumes/${newResumeId}`);
    },
    onError: (mutationError) => {
      console.error("Failed to create resume:", mutationError);
      toast.error("Could not create resume. Please try again.");
      setPendingResumeId(null);
    },
  });

  const renameResumeMutation = useMutation({
    mutationFn: async ({ resumeId, title }) => {
      if (!userId) {
        throw new Error("User ID is required to update a resume.");
      }
      return updateUserResumeTitle(userId, resumeId, title);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["resumes", userId] });
      resetEditing();
    },
    onError: (mutationError) => {
      console.error("Failed to rename resume:", mutationError);
      toast.error("Could not rename resume. Please try again.");
    },
  });

  const deleteResumeMutation = useMutation({
    mutationFn: async ({ resumeId }) => {
      if (!userId) {
        throw new Error("User ID is required to delete a resume.");
      }
      return deleteUserResume(userId, resumeId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["resumes", userId] });
      toast.success("Resume deleted");
    },
    onError: (mutationError) => {
      console.error("Failed to delete resume:", mutationError);
      toast.error("Could not delete resume. Please try again.");
    },
    onSettled: () => {
      setResumeToDelete(null);
    },
  });

  const renameIsPending =
    renameResumeMutation.isPending &&
    renameResumeMutation.variables?.resumeId === editingResumeId;

  useEffect(() => {
    if (!pendingResumeId) {
      return;
    }
    try {
      router.prefetch(`/resumes/${pendingResumeId}`);
    } catch (error) {
      console.error("Failed to prefetch resume route", error);
    }
  }, [pendingResumeId, router]);

  function handleStartEditing(resume) {
    setEditingResumeId(resume.id);
    setTitleDraft(resume.title);
  }

  function handleSubmitRename() {
    if (!editingResumeId || renameResumeMutation.isPending) {
      return;
    }
    const trimmed = titleDraft.trim() || "Untitled";
    const existingTitle = resumes.find(
      (item) => item.id === editingResumeId
    )?.title;
    if (existingTitle === trimmed) {
      resetEditing();
      return;
    }
    renameResumeMutation.mutate({ resumeId: editingResumeId, title: trimmed });
  }

  function handleKeyDown(event) {
    if (event.key === "Enter") {
      event.preventDefault();
      handleSubmitRename();
    }
    if (event.key === "Escape") {
      resetEditing();
    }
  }

  const createButtonIcon = createResumeMutation.isPending ? (
    <Loader2 className="size-4 animate-spin" />
  ) : (
    <PlusCircle className="size-4" />
  );

  const hasResumes = useMemo(() => resumes.length > 0, [resumes]);

  return (
    <div className="relative">
      {pendingResumeId ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/90 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-4 rounded-md border border-border bg-card px-8 py-6 shadow-lg">
            <div className="flex size-12 items-center justify-center rounded-full border border-border/60 bg-muted">
              <Loader2 className="size-6 animate-spin text-muted-foreground" />
            </div>
            <div className="text-center text-sm text-muted-foreground">
              Preparing your AI workspace...
            </div>
          </div>
        </div>
      ) : null}
      {resumeToDelete ? (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-sm rounded-md border border-border bg-card shadow-xl">
            <div className="border-b border-border/60 px-5 py-4">
              <h2 className="text-base font-semibold">Delete resume</h2>
            </div>
            <div className="space-y-4 px-5 py-5 text-sm text-muted-foreground">
              <p>
                This will permanently delete{" "}
                <span className="font-medium text-foreground">
                  {resumeToDelete.title || "Untitled"}
                </span>{" "}
                and its data. This action cannot be undone.
              </p>
            </div>
            <div className="flex justify-end gap-3 border-t border-border/60 px-5 py-4">
              <Button
                variant="ghost"
                onClick={() => setResumeToDelete(null)}
                disabled={deleteResumeMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={() =>
                  deleteResumeMutation.mutate({
                    resumeId: resumeToDelete.id,
                  })
                }
                disabled={deleteResumeMutation.isPending}
                className="inline-flex items-center gap-2"
              >
                {deleteResumeMutation.isPending ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Trash2 className="size-4" />
                )}
                Delete
              </Button>
            </div>
          </div>
        </div>
      ) : null}
      <section className="mx-auto flex w-full max-w-5xl flex-col gap-8 py-16">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Welcome back
            {user?.displayName
              ? `, ${user.displayName.split(" ")[0]}`
              : ""}.
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Manage resumes, track AI conversations, and keep everything synced
            to Firebase.
          </p>
        </div>
        <Button
          className="inline-flex items-center gap-2"
          onClick={() => createResumeMutation.mutate()}
          disabled={createResumeMutation.isPending || !userId}
        >
          {createButtonIcon}
          New AI resume
        </Button>
      </header>

      {isError ? (
        <div className="rounded-md border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive">
          {error?.message || "Failed to load resumes. Please try again."}
        </div>
      ) : null}

      {isLoading ? (
        <div className="grid gap-6 sm:grid-cols-2">
          {Array.from({ length: 4 }).map((_, index) => (
            <Card key={index} className="border-muted">
              <CardHeader className="space-y-2">
                <div className="h-5 w-2/3 animate-pulse rounded bg-muted" />
                <div className="h-4 w-1/3 animate-pulse rounded bg-muted" />
              </CardHeader>
              <CardContent>
                <div className="h-4 w-1/2 animate-pulse rounded bg-muted" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : hasResumes ? (
        <div className="grid gap-6 sm:grid-cols-2">
          {resumes.map((resume) => (
            <Card key={resume.id} className="border-muted">
              <CardHeader className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  {editingResumeId === resume.id ? (
                    <Input
                      value={titleDraft}
                      onChange={(event) => setTitleDraft(event.target.value)}
                      onKeyDown={handleKeyDown}
                      disabled={renameIsPending}
                      autoFocus
                    />
                  ) : (
                    <CardTitle className="text-base font-medium">
                      {resume.title}
                    </CardTitle>
                  )}
                  <div className="flex shrink-0 items-center gap-2">
                    {editingResumeId === resume.id ? (
                      <>
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={handleSubmitRename}
                          disabled={renameIsPending}
                          className="inline-flex items-center gap-1"
                        >
                          {renameIsPending ? (
                            <Loader2 className="size-4 animate-spin" />
                          ) : (
                            <Check className="size-4" />
                          )}
                          Save
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={resetEditing}
                          disabled={renameIsPending}
                          className="inline-flex items-center gap-1"
                        >
                          <X className="size-4" />
                          Cancel
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleStartEditing(resume)}
                          className="inline-flex items-center gap-1"
                        >
                          <Pencil className="size-4" />
                          Rename
                        </Button>
                        <Button asChild size="sm" variant="outline">
                          <Link href={`/resumes/${resume.id}`}>Open</Link>
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setResumeToDelete(resume)}
                          className="inline-flex items-center gap-1 text-destructive hover:text-destructive"
                        >
                          <Trash2 className="size-4" />
                          Delete
                        </Button>
                      </>
                    )}
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  Last updated {formatDate(resume.updatedAt)}
                </p>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  {resume.fileName
                    ? `Uploaded file: ${resume.fileName}`
                    : "No upload linked yet."}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-muted p-12 text-center">
          <h2 className="text-lg font-medium">Create your first resume</h2>
          <p className="mt-2 max-w-sm text-sm text-muted-foreground">
            Start fresh with an AI-assisted workspace or upload an existing
            resume to begin refining it with recommendations.
          </p>
          <Button
            className="mt-6 inline-flex items-center gap-2"
            onClick={() => createResumeMutation.mutate()}
            disabled={createResumeMutation.isPending || !userId}
          >
            {createButtonIcon}
            New AI resume
          </Button>
        </div>
      )}
      </section>
    </div>
  );
}
