import { createEmptyResume } from "@/lib/models/resume";

export function buildSampleResume() {
  const resume = createEmptyResume({
    id: "sample",
    title: "Product Designer Resume",
    ownerId: "sample-user",
  });

  resume.basics = {
    ...resume.basics,
    fullName: "Alex Johnson",
    headline: "Product Designer · AI Enthusiast",
    location: "San Francisco, CA",
    email: "alex.johnson@example.com",
    phone: "+1 (555) 123-4567",
    summary:
      "Product designer with 5+ years crafting human-centered experiences. Obsessed with rapid prototyping and data-informed iteration.",
  };

  resume.experience = [
    {
      id: "exp-1",
      role: "Senior Product Designer",
      company: "BrightLabs",
      startDate: "2021",
      endDate: "Present",
      bullets: [
        "Led the redesign of the onboarding flow, improving conversion by 18%.",
        "Partnered with PMs and engineers to ship AI-assisted authoring tools used by 50K+ active users.",
      ],
    },
    {
      id: "exp-2",
      role: "Product Designer",
      company: "Nova Systems",
      startDate: "2018",
      endDate: "2021",
      bullets: [
        "Defined UX patterns across mobile and web, reducing design debt by 30%.",
        "Hosted design critiques and mentored two junior designers.",
      ],
    },
  ];

  resume.education = [
    {
      id: "edu-1",
      institution: "ArtCenter College of Design",
      degree: "BFA, Interaction Design",
      startYear: "2014",
      endYear: "2018",
      details: ["Graduated with distinction", "Capstone: AR interface for smart manufacturing."],
    },
  ];

  resume.skills = [
    "Product Discovery",
    "Interaction Design",
    "User Research",
    "Figma",
    "Prototyping",
    "Design Systems",
  ];

  resume.projects = [
    {
      id: "proj-1",
      name: "AI Resume Workshop",
      link: "https://example.com",
      highlights: [
        "Conducted 5 workshops helping 200+ students build AI-tailored resumes.",
        "Collaborated with developers to streamline resume export workflows.",
      ],
    },
  ];

  return resume;
}
