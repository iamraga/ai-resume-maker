"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { useResumeStore } from "@/lib/state/resume-store";
import { toast } from "sonner";

export function SectionEditor() {
  const resume = useResumeStore((state) => state.resume);
  const updateSection = useResumeStore((state) => state.updateSection);
  const [summary, setSummary] = useState(resume.basics.summary);

  useEffect(() => {
    setSummary(resume.basics.summary || "");
  }, [resume.basics.summary]);

  function handleSummarySave() {
    updateSection("basics", (basics) => ({
      ...basics,
      summary,
    }));
    toast.success("Summary updated in live preview");
  }

  return (
    <Tabs defaultValue="summary" className="w-full">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="summary">Summary</TabsTrigger>
        <TabsTrigger value="experience">Experience</TabsTrigger>
        <TabsTrigger value="skills">Skills</TabsTrigger>
      </TabsList>
      <TabsContent value="summary" className="mt-4">
        <div className="space-y-2">
          <Textarea
            value={summary}
            onChange={(event) => setSummary(event.target.value)}
            placeholder="Write or paste a professional summary. Ask the AI assistant for rewrites."
            className="h-40"
          />
          <Button onClick={handleSummarySave} className="self-end">
            Apply to resume
          </Button>
        </div>
      </TabsContent>
      <TabsContent value="experience" className="mt-4 text-sm text-muted-foreground">
        Experience editing will live here. We will render dynamic role cards and integrate AI suggestions.
      </TabsContent>
      <TabsContent value="skills" className="mt-4">
        <p className="text-sm text-muted-foreground">
          Quickly capture core skills. We will sync these with the live resume preview and AI suggestions.
        </p>
        <Input placeholder="e.g., React, Firebase, UI Design" className="mt-2" disabled />
      </TabsContent>
    </Tabs>
  );
}
