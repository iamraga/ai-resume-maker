"use client";

import { useEffect, useState } from "react";
import { ChevronDown, PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { useResumeStore } from "@/lib/state/resume-store";
import { toast } from "sonner";

export function SectionEditor() {
  const resume = useResumeStore((state) => state.resume);
  const updateSection = useResumeStore((state) => state.updateSection);
  const [fullName, setFullName] = useState(resume.basics.fullName);
  const [headline, setHeadline] = useState(resume.basics.headline);
  const [email, setEmail] = useState(resume.basics.email);
  const [phone, setPhone] = useState(resume.basics.phone);
  const [city, setCity] = useState(resume.basics.location?.split(",")[0]?.trim() || "");
  const [country, setCountry] = useState(resume.basics.location?.split(",")[1]?.trim() || "");
  const [linksText, setLinksText] = useState((resume.basics.links || []).join("\n"));
  const [summary, setSummary] = useState(resume.basics.summary);
  const [skillsText, setSkillsText] = useState(resume.skills.join("\n"));
  const [openSection, setOpenSection] = useState("");

  useEffect(() => {
    setFullName(resume.basics.fullName || "");
    setHeadline(resume.basics.headline || "");
    setEmail(resume.basics.email || "");
    setPhone(resume.basics.phone || "");
    const [currentCity = "", currentCountry = ""] = (resume.basics.location || "").split(",");
    setCity(currentCity.trim());
    setCountry(currentCountry.trim());
    setLinksText((resume.basics.links || []).join("\n"));
  }, [
    resume.basics.fullName,
    resume.basics.headline,
    resume.basics.email,
    resume.basics.phone,
    resume.basics.location,
    resume.basics.links,
  ]);

  useEffect(() => {
    setSummary(resume.basics.summary || "");
  }, [resume.basics.summary]);

  useEffect(() => {
    setSkillsText(resume.skills.join("\n"));
  }, [resume.skills]);

  function toggleSection(section) {
    setOpenSection((current) => (current === section ? "" : section));
  }

  function handleSummarySave() {
    updateSection("basics", (basics) => ({
      ...basics,
      summary,
    }));
    toast.success("Summary updated in live preview");
  }

  function handleSkillsSave() {
    const nextSkills = skillsText
      .split("\n")
      .map((skill) => skill.trim())
      .filter(Boolean);
    updateSection("skills", nextSkills);
    toast.success("Skills updated");
  }

  function handleExperienceFieldChange(index, field, value) {
    updateSection("experience", (experience) => {
      const draft = [...experience];
      draft[index] = { ...draft[index], [field]: value };
      return draft;
    });
  }

  function handleExperienceBulletsChange(index, value) {
    const bullets = value
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);
    handleExperienceFieldChange(index, "bullets", bullets);
  }

  function handleAddExperience() {
    updateSection("experience", (experience) => [
      ...experience,
      {
        id: crypto.randomUUID(),
        role: "",
        company: "",
        startDate: "",
        endDate: "",
        bullets: [],
      },
    ]);
  }

  function handleRemoveExperience(index) {
    updateSection("experience", (experience) => {
      const draft = [...experience];
      draft.splice(index, 1);
      return draft;
    });
  }

  function handleEducationFieldChange(index, field, value) {
    updateSection("education", (education) => {
      const draft = [...education];
      draft[index] = { ...draft[index], [field]: value };
      return draft;
    });
  }

  function handleEducationDetailsChange(index, value) {
    const details = value
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);
    handleEducationFieldChange(index, "details", details);
  }

  function handleAddEducation() {
    updateSection("education", (education) => [
      ...education,
      {
        id: crypto.randomUUID(),
        institution: "",
        degree: "",
        startYear: "",
        endYear: "",
        details: [],
      },
    ]);
  }

  function handleRemoveEducation(index) {
    updateSection("education", (education) => {
      const draft = [...education];
      draft.splice(index, 1);
      return draft;
    });
  }

  const sections = [
    {
      id: "basics",
      title: "Contact details",
      description: "Name, headline, location, and links shown at the top of your resume.",
      content: (
        <div className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <Field
              label="Full name"
              value={fullName}
              placeholder="Jordan Brooks"
              onChange={setFullName}
            />
            <Field
              label="Headline"
              value={headline}
              placeholder="Senior Product Marketing Manager"
              onChange={setHeadline}
            />
            <Field
              label="Email"
              value={email}
              placeholder="you@email.com"
              onChange={setEmail}
            />
            <Field
              label="Phone"
              value={phone}
              placeholder="+1 (555) 123-4567"
              onChange={setPhone}
            />
            <Field
              label="City"
              value={city}
              placeholder="San Francisco"
              onChange={setCity}
            />
            <Field
              label="Country"
              value={country}
              placeholder="United States"
              onChange={setCountry}
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Links
            </label>
            <Textarea
              value={linksText}
              onChange={(event) => setLinksText(event.target.value)}
              placeholder="https://linkedin.com/in/you\nhttps://github.com/you"
              className="min-h-[100px]"
            />
          </div>
          <div className="flex justify-end">
            <Button
              type="button"
              onClick={() => {
                const cleanedLocation = [city, country].filter(Boolean).join(", ").trim();
                const links = linksText
                  .split("\n")
                  .map((link) => link.trim())
                  .filter(Boolean);
                updateSection("basics", (basics) => ({
                  ...basics,
                  fullName,
                  headline,
                  email,
                  phone,
                  location: cleanedLocation,
                  links,
                }));
                toast.success("Contact details updated");
              }}
            >
              Apply to resume
            </Button>
          </div>
        </div>
      ),
    },
    {
      id: "summary",
      title: "Professional summary",
      description: "Explain your pitch in 2-3 sentences.",
      content: (
        <div className="space-y-2">
          <Textarea
            value={summary}
            onChange={(event) => setSummary(event.target.value)}
            placeholder="Write or paste a professional summary. Ask the AI assistant for rewrites."
            className="min-h-[140px]"
          />
          <div className="flex justify-end">
            <Button onClick={handleSummarySave}>Apply to resume</Button>
          </div>
        </div>
      ),
    },
    {
      id: "experience",
      title: "Experience",
      description: "Capture each role with dates and bullet points.",
      content: (
        <div className="space-y-4">
          {resume.experience.length === 0 ? (
            <div className="rounded-lg border border-dashed border-muted bg-muted/20 p-4 text-sm text-muted-foreground">
              No roles yet. Capture your first experience entry to see it reflected
              in the live preview.
            </div>
          ) : (
            resume.experience.map((item, index) => (
              <div key={item.id} className="rounded-lg border p-4 space-y-3">
                <div className="grid gap-3 sm:grid-cols-2">
                  <Field
                    label="Title"
                    value={item.role}
                    placeholder="Role or title"
                    onChange={(value) =>
                      handleExperienceFieldChange(index, "role", value)
                    }
                  />
                  <Field
                    label="Company"
                    value={item.company}
                    placeholder="Company"
                    onChange={(value) =>
                      handleExperienceFieldChange(index, "company", value)
                    }
                  />
                  <Field
                    label="Start"
                    value={item.startDate}
                    placeholder="Start date"
                    onChange={(value) =>
                      handleExperienceFieldChange(index, "startDate", value)
                    }
                  />
                  <Field
                    label="End"
                    value={item.endDate}
                    placeholder="End date"
                    onChange={(value) =>
                      handleExperienceFieldChange(index, "endDate", value)
                    }
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Bullet points
                  </label>
                  <Textarea
                    value={(item.bullets || []).join("\n")}
                    onChange={(event) =>
                      handleExperienceBulletsChange(index, event.target.value)
                    }
                    placeholder="Each line becomes a bullet in the preview."
                    className="min-h-[120px]"
                  />
                </div>
                <div className="flex justify-end">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveExperience(index)}
                  >
                    Remove role
                  </Button>
                </div>
              </div>
            ))
          )}
          <Button type="button" onClick={handleAddExperience} variant="outline">
            Add role
          </Button>
        </div>
      ),
    },
    {
      id: "education",
      title: "Education",
      description: "Summarize your academic history.",
      content: (
        <div className="space-y-4">
          {resume.education.length === 0 ? (
            <div className="rounded-lg border border-dashed border-muted bg-muted/20 p-4 text-sm text-muted-foreground">
              No education entries yet.
            </div>
          ) : (
            resume.education.map((item, index) => (
              <div key={item.id} className="rounded-lg border p-4 space-y-3">
                <div className="grid gap-3 sm:grid-cols-2">
                  <Field
                    label="Institution"
                    value={item.institution}
                    placeholder="University"
                    onChange={(value) =>
                      handleEducationFieldChange(index, "institution", value)
                    }
                  />
                  <Field
                    label="Degree"
                    value={item.degree}
                    placeholder="Degree or program"
                    onChange={(value) =>
                      handleEducationFieldChange(index, "degree", value)
                    }
                  />
                  <Field
                    label="Start year"
                    value={item.startYear}
                    placeholder="2019"
                    onChange={(value) =>
                      handleEducationFieldChange(index, "startYear", value)
                    }
                  />
                  <Field
                    label="End year"
                    value={item.endYear}
                    placeholder="2023"
                    onChange={(value) =>
                      handleEducationFieldChange(index, "endYear", value)
                    }
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Highlights
                  </label>
                  <Textarea
                    value={(item.details || []).join("\n")}
                    onChange={(event) =>
                      handleEducationDetailsChange(index, event.target.value)
                    }
                    placeholder="Each line becomes a bullet."
                    className="min-h-[100px]"
                  />
                </div>
                <div className="flex justify-end">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveEducation(index)}
                  >
                    Remove entry
                  </Button>
                </div>
              </div>
            ))
          )}
          <Button type="button" onClick={handleAddEducation} variant="outline">
            Add education
          </Button>
        </div>
      ),
    },
    {
      id: "skills",
      title: "Skills",
      description: "List each skill on its own line.",
      content: (
        <div className="space-y-2">
          <Textarea
            value={skillsText}
            onChange={(event) => setSkillsText(event.target.value)}
            className="min-h-[160px]"
            placeholder="React\nFirebase\nLeadership"
          />
          <div className="flex justify-end">
            <Button onClick={handleSkillsSave}>Apply to resume</Button>
          </div>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-3">
      {sections.map((section) => {
        const isOpen = openSection === section.id;
        return (
          <div
            key={section.id}
            className="overflow-hidden rounded-lg border bg-card"
          >
            <button
              type="button"
              onClick={() => toggleSection(section.id)}
              className="flex w-full items-center justify-between px-4 py-3 text-left transition hover:bg-muted/60"
              style={{ cursor: "pointer" }}
            >
              <div>
                <p className="text-sm font-medium text-foreground">
                  {section.title}
                </p>
                <p className="text-xs text-muted-foreground">
                  {section.description}
                </p>
              </div>
              <ChevronDown
                className={`size-4 transition-transform ${isOpen ? "rotate-180" : ""}`}
              />
            </button>
            {isOpen ? (
              <div className="border-t px-4 py-4 text-sm text-muted-foreground">
                {section.content}
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}

function Field({ label, value, onChange, ...props }) {
  return (
    <div className="space-y-1">
      <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </label>
      <Input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        {...props}
      />
    </div>
  );
}
