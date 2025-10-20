"use client";

import { useEffect, useMemo } from "react";
import { uploadPlaceholderItems } from "@/lib/placeholders/uploads";
import { buildSampleResume } from "@/lib/placeholders/resume";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ChatPanel } from "@/components/editor/chat-panel";
import { ResumePreview } from "@/components/editor/resume-preview";
import { SectionEditor } from "@/components/editor/section-editor";
import { Button } from "@/components/ui/button";
import { useResumeStore } from "@/lib/state/resume-store";

export function EditorShell() {
  const uploads = useMemo(() => uploadPlaceholderItems, []);
  const setResume = useResumeStore((state) => state.setResume);

  useEffect(() => {
    setResume(buildSampleResume());
  }, [setResume]);

  return (
    <div className="grid gap-6 py-8 lg:grid-cols-[minmax(0,380px)_1fr]">
      <div className="flex h-full flex-col gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold">Uploads</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {uploads.map((upload) => (
              <div key={upload.id} className="rounded-lg border p-3 text-sm">
                <p className="font-medium">{upload.name}</p>
                <p className="text-xs text-muted-foreground">
                  Uploaded {upload.uploadedAt.toLocaleDateString()} · {upload.status}
                </p>
              </div>
            ))}
            <Button variant="outline" disabled className="w-full">
              Upload resume (coming soon)
            </Button>
          </CardContent>
        </Card>
        <Card className="flex-1">
          <CardHeader>
            <CardTitle className="text-base font-semibold">AI Assistant</CardTitle>
          </CardHeader>
          <CardContent className="h-[500px]">
            <ChatPanel />
          </CardContent>
        </Card>
      </div>
      <div className="flex h-full flex-col gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold">Resume Editor</CardTitle>
          </CardHeader>
          <CardContent>
            <SectionEditor />
          </CardContent>
        </Card>
        <Separator />
        <ResumePreview />
      </div>
    </div>
  );
}
