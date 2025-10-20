"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useResumeStore } from "@/lib/state/resume-store";

export function ResumePreview() {
  const resume = useResumeStore((state) => state.resume);

  return (
    <Card className="h-full overflow-hidden">
      <CardHeader>
        <CardTitle className="text-xl font-semibold">{resume.basics.fullName || "Your Name"}</CardTitle>
        <p className="text-sm text-muted-foreground">{resume.basics.headline || "Professional Headline"}</p>
        <p className="text-xs text-muted-foreground">
          {resume.basics.email || "you@email.com"} · {resume.basics.location || "City, Country"}
        </p>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[70vh] px-6 py-4">
          <Section title="Summary" items={[resume.basics.summary || "Use the AI assistant to craft a concise summary."]} />
          <Section
            title="Experience"
            items={
              resume.experience.length
                ? resume.experience.map((item) => (
                    <div key={item.id} className="space-y-1">
                      <p className="font-medium">
                        {item.role} · {item.company}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {item.startDate} — {item.endDate || "Present"}
                      </p>
                      <ul className="list-disc pl-4 text-sm">
                        {item.bullets.map((bullet, idx) => (
                          <li key={idx}>{bullet}</li>
                        ))}
                      </ul>
                    </div>
                  ))
                : [
                    "When you add experience entries, they will appear here with bullet points suggested by the AI assistant.",
                  ]
            }
          />
          <Section
            title="Education"
            items={
              resume.education.length
                ? resume.education.map((item) => (
                    <div key={item.id} className="space-y-1">
                      <p className="font-medium">
                        {item.degree} · {item.institution}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {item.startYear} — {item.endYear}
                      </p>
                      <ul className="list-disc pl-4 text-sm">
                        {item.details.map((detail, idx) => (
                          <li key={idx}>{detail}</li>
                        ))}
                      </ul>
                    </div>
                  ))
                : ["Add education details to see them reflected in the live preview."]
            }
          />
          <Section
            title="Skills"
            items={
              resume.skills.length
                ? [resume.skills.join(" · ")]
                : ["Group your skills to highlight your core strengths."]
            }
          />
          {resume.projects?.length ? (
            <Section
              title="Projects"
              items={resume.projects.map((project) => (
                <div key={project.id} className="space-y-1">
                  <p className="font-medium">
                    {project.name} {project.link ? `· ${project.link}` : ""}
                  </p>
                  <ul className="list-disc pl-4 text-sm">
                    {project.highlights.map((highlight, idx) => (
                      <li key={idx}>{highlight}</li>
                    ))}
                  </ul>
                </div>
              ))}
            />
          ) : null}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

function Section({ title, items }) {
  return (
    <div className="py-4">
      <h3 className="text-base font-semibold uppercase tracking-wide text-muted-foreground">{title}</h3>
      <Separator className="my-2" />
      <div className="space-y-3">
        {items.map((item, index) => (
          <div key={index} className="text-sm leading-relaxed text-foreground">
            {item}
          </div>
        ))}
      </div>
    </div>
  );
}
