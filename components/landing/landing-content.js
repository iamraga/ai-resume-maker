"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/lib/state/auth-store";
import { useAuthModalStore } from "@/lib/state/auth-modal-store";

const landingHighlights = [
  {
    title: "Upload & Parse",
    description:
      "Drop in a PDF or DOCX file and we will extract the relevant details for quick editing.",
  },
  {
    title: "Chat with AI",
    description:
      "Ask the assistant to rewrite bullet points, expand on achievements, and tailor your story.",
  },
  {
    title: "Live Preview",
    description:
      "See applied changes in a structured resume canvas, then export a polished PDF instantly.",
  },
];

export function LandingContent() {
  const user = useAuthStore((state) => state.user);
  const openModal = useAuthModalStore((state) => state.openModal);

  return (
    <main className="flex flex-col items-center gap-10 py-24 px-6 text-center">
      <div className="max-w-3xl space-y-6">
        <span className="inline-flex items-center gap-2 rounded-full border px-4 py-1 text-sm text-muted-foreground">
          Launching soon · AI Resume Builder MVP
        </span>
        <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
          Craft job-ready resumes in minutes with AI guidance.
        </h1>
        <p className="text-lg text-muted-foreground">
          Upload your existing resume, collaborate with an AI assistant to polish every section, and export a
          polished PDF when you are ready to apply.
        </p>
      </div>
      {user ? (
        <Button asChild size="lg">
          <Link href="/dashboard" className="inline-flex items-center gap-2">
            Go to dashboard
            <ArrowRight className="size-4" />
          </Link>
        </Button>
      ) : (
        <Button size="lg" variant="outline" onClick={openModal} className="inline-flex items-center gap-2">
          Sign in
          <ArrowRight className="size-4" />
        </Button>
      )}
      <div className="max-w-3xl text-left grid gap-6 sm:grid-cols-3">
        {landingHighlights.map((item) => (
          <div key={item.title} className="rounded-xl border bg-card p-6 shadow-sm">
            <h2 className="text-lg font-medium">{item.title}</h2>
            <p className="mt-2 text-sm text-muted-foreground">{item.description}</p>
          </div>
        ))}
      </div>
    </main>
  );
}
