"use client";

import { useMemo, useRef, useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Copy, Check, Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useResumeStore } from "@/lib/state/resume-store";
import { useAuthStore } from "@/lib/state/auth-store";
import { auth } from "@/lib/firebase/client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const MESSAGE_LIMIT = 50;

async function getAuthToken() {
  const current = auth.currentUser;
  if (!current) {
    throw new Error("You must be signed in to chat with the assistant.");
  }
  return current.getIdToken();
}

export function ChatPanel({ resumeId, className }) {
  const [input, setInput] = useState("");
  const [copiedMessageId, setCopiedMessageId] = useState(null);
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);
  const authLoading = useAuthStore((state) => state.loading);
  const resume = useResumeStore((state) => state.resume);
  const viewportRef = useRef(null);

  const queryKey = useMemo(
    () => ["resume", resumeId, "chat"],
    [resumeId]
  );

  const {
    data,
    isLoading: loadingMessages,
    isError,
    error,
  } = useQuery({
    queryKey,
    queryFn: async () => {
      const token = await getAuthToken();
      const response = await fetch(
        `/api/resumes/${resumeId}/chat?limit=${MESSAGE_LIMIT}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (!response.ok) {
        const payload = await response.json().catch(() => null);
        throw new Error(payload?.error || "Failed to load chat history.");
      }
      return response.json();
    },
    enabled: Boolean(resumeId && user && !authLoading),
    refetchOnWindowFocus: false,
    staleTime: 1000 * 15,
  });

  const messages = data?.messages ?? [];
  useEffect(() => {
    if (loadingMessages) {
      return;
    }
    const viewport = viewportRef.current;
    if (viewport) {
      viewport.scrollTop = viewport.scrollHeight;
    }
  }, [loadingMessages, messages.length]);

  const sendMessageMutation = useMutation({
    mutationFn: async ({ content }) => {
      const token = await getAuthToken();
      const response = await fetch(`/api/resumes/${resumeId}/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ message: content }),
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => null);
        throw new Error(payload?.error || "The assistant is unavailable.");
      }

      return response.json();
    },
    onError: (mutationError, variables) => {
      queryClient.setQueryData(queryKey, (old) => {
        const existing = old?.messages ?? [];
        return {
          messages: existing.filter(
            (message) =>
              message.id !== variables.tempUserId &&
              message.id !== variables.tempAssistantId
          ),
        };
      });
      toast.error(mutationError.message);
    },
    onSuccess: (payload, variables) => {
      queryClient.setQueryData(queryKey, (old) => {
        const existing = old?.messages ?? [];
        return {
          messages: existing.map((message) => {
            if (message.id === variables.tempUserId) {
              return {
                ...payload.userMessage,
                createdAt: new Date().toISOString(),
              };
            }
            if (message.id === variables.tempAssistantId) {
              return {
                ...payload.assistantMessage,
                createdAt: new Date().toISOString(),
              };
            }
            return message;
          }),
        };
      });
      queryClient.invalidateQueries({ queryKey });
    },
  });

  const handleSend = async (event) => {
    event.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || sendMessageMutation.isPending) {
      return;
    }

    const tempUserId = crypto.randomUUID();
    const tempAssistantId = `${tempUserId}-assistant`;

    queryClient.setQueryData(queryKey, (old) => {
      const existing = old?.messages ?? [];
      return {
        messages: [
          ...existing,
          {
            id: tempUserId,
            role: "user",
            content: trimmed,
            createdAt: new Date().toISOString(),
            pending: true,
          },
          {
            id: tempAssistantId,
            role: "assistant",
            content: "Thinking through a helpful response…",
            createdAt: new Date().toISOString(),
            pending: true,
          },
        ].slice(-MESSAGE_LIMIT),
      };
    });

    setInput("");
    sendMessageMutation.mutate({
      content: trimmed,
      tempUserId,
      tempAssistantId,
    });
  };

  const handleCopy = async (message) => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopiedMessageId(message.id);
      setTimeout(() => setCopiedMessageId(null), 1500);
    } catch {
      toast.error("Unable to copy this suggestion. Please try again.");
    }
  };

  const emptyState = (
    <div className="rounded-lg border border-dashed border-muted px-4 py-6 text-sm text-muted-foreground">
      <p className="font-medium text-foreground">
        Welcome to your resume writing copilot.
      </p>
      <p className="mt-2">
        Ask for stronger bullet points, quantify achievements, or request a
        summary rewrite. The assistant only uses details from your resume to
        keep suggestions factual.
      </p>
    </div>
  );

  return (
    <div className={cn("flex h-full flex-col overflow-hidden rounded-xl border bg-card", className)}>
      <ScrollArea className="flex-1 overflow-auto" viewportRef={viewportRef}>
        <div className="space-y-4 px-4 py-6">
          {loadingMessages ? (
            <div className="flex items-center gap-2 rounded-lg border px-4 py-3 text-sm text-muted-foreground">
              <Loader2 className="size-4 animate-spin" />
              Loading your conversation…
            </div>
          ) : isError ? (
            <div className="rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              {error?.message || "We couldn’t load your assistant history."}
            </div>
          ) : messages.length ? (
            messages.map((message) => (
              <div
                key={message.id}
                className={`rounded-lg border px-4 py-3 text-sm shadow-sm ${
                  message.role === "assistant"
                    ? "bg-muted/70 text-foreground"
                    : "bg-primary text-primary-foreground"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="whitespace-pre-line break-words leading-relaxed">
                    {message.content}
                  </div>
                  {message.role === "assistant" ? (
                    <button
                      type="button"
                      onClick={() => handleCopy(message)}
                      className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-transparent bg-muted/60 text-muted-foreground transition hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      aria-label="Copy suggestion"
                    >
                      {copiedMessageId === message.id ? (
                        <Check className="size-4" />
                      ) : (
                        <Copy className="size-4" />
                      )}
                    </button>
                  ) : null}
                </div>
                {message.pending ? (
                  <p className="mt-2 text-xs opacity-70">
                    Drafting response…
                  </p>
                ) : null}
              </div>
            ))
          ) : (
            emptyState
          )}
        </div>
      </ScrollArea>
      <form onSubmit={handleSend} className="border-t p-4">
        <Textarea
          placeholder="Ask the assistant for stronger bullets, ATS keywords, or a rewritten summary…"
          value={input}
          onChange={(event) => setInput(event.target.value)}
          className="mb-3 h-24 resize-none"
          disabled={!resumeId || sendMessageMutation.isPending}
        />
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <Sparkles className="size-3.5" />
            The assistant relies on your saved resume and upload. It won’t invent experience.
          </span>
          <Button
            type="submit"
            disabled={
              !input.trim() || sendMessageMutation.isPending || !resumeId
            }
            size="sm"
            className="inline-flex items-center gap-2"
          >
            {sendMessageMutation.isPending ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Sending
              </>
            ) : (
              "Send"
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
