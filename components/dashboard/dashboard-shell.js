"use client";

import Link from "next/link";
import { PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuthStore } from "@/lib/state/auth-store";

const sampleResumes = [
  {
    id: "sample-1",
    title: "Product Designer Resume",
    updatedAt: "2024-01-10T12:00:00.000Z",
  },
  {
    id: "sample-2",
    title: "Software Engineer Resume",
    updatedAt: "2024-02-01T09:35:00.000Z",
  },
];

export function DashboardShell() {
  const user = useAuthStore((state) => state.user);

  return (
    <section className="mx-auto flex w-full max-w-5xl flex-col gap-8 py-16">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Welcome back{user?.displayName ? `, ${user.displayName.split(" ")[0]}` : ""}.
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Manage resumes, track AI conversations, and keep everything synced to Firebase.
          </p>
        </div>
        <Button className="inline-flex items-center gap-2" disabled>
          <PlusCircle className="size-4" />
          New AI resume
        </Button>
      </header>
      <div className="grid gap-6 sm:grid-cols-2">
        {sampleResumes.map((resume) => (
          <Card key={resume.id} className="border-muted">
            <CardHeader>
              <CardTitle className="flex items-center justify-between text-base font-medium">
                {resume.title}
                <Button asChild size="sm" variant="outline">
                  <Link href={`/resumes/${resume.id}`}>Open</Link>
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Last edited on {new Date(resume.updatedAt).toLocaleDateString()}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
