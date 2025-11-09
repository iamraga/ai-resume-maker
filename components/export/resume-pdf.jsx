import React from "react";
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: {
    fontFamily: "Helvetica",
    backgroundColor: "#f4eeff",
    color: "#1f123f",
    paddingVertical: 40,
    paddingHorizontal: 48,
    fontSize: 10,
    lineHeight: 1.5,
  },
  header: {
    borderBottom: "1 solid #d9c6ff",
    paddingBottom: 16,
    marginBottom: 18,
  },
  name: {
    fontSize: 20,
    fontWeight: 600,
    color: "#371b71",
  },
  headline: {
    fontSize: 11,
    marginTop: 4,
    color: "#5c4c7f",
  },
  contact: {
    marginTop: 8,
    fontSize: 9,
    color: "#433256",
  },
  section: {
    marginBottom: 18,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 600,
    color: "#4a1fb8",
    borderBottom: "1 solid #d9c6ff",
    paddingBottom: 4,
    marginBottom: 8,
  },
  summaryText: {
    fontSize: 10,
    color: "#2c1f43",
  },
  listItem: {
    fontSize: 10,
    marginBottom: 4,
  },
  experienceRole: {
    fontSize: 11,
    fontWeight: 600,
    color: "#2d115c",
  },
  muted: {
    color: "#6f5f8e",
    marginBottom: 4,
  },
  bullet: {
    flexDirection: "row",
    marginBottom: 3,
  },
  bulletSymbol: {
    width: 10,
  },
  skills: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  chip: {
    backgroundColor: "#e9dfff",
    color: "#2c1455",
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 4,
    fontSize: 9,
    marginRight: 4,
    marginBottom: 4,
  },
});

export function ResumeDocument({ resume }) {
  const basics = resume.content?.basics || {};
  const experience = resume.content?.experience || [];
  const education = resume.content?.education || [];
  const skills = resume.content?.skills || [];
  const projects = resume.content?.projects || [];

  const links = basics.links || [];

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.name}>{basics.fullName || "Unnamed candidate"}</Text>
          {basics.headline ? <Text style={styles.headline}>{basics.headline}</Text> : null}
          <Text style={styles.contact}>
            {[basics.email, basics.phone, basics.location].filter(Boolean).join("  •  ")}
          </Text>
          {links.length ? (
            <Text style={[styles.contact, { marginTop: 2 }]}>
              {links.join("  •  ")}
            </Text>
          ) : null}
        </View>

        {basics.summary ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Summary</Text>
            <Text style={styles.summaryText}>{basics.summary}</Text>
          </View>
        ) : null}

        {experience.length ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Experience</Text>
            {experience.map((item) => (
              <View key={item.id} style={{ marginBottom: 8 }}>
                <Text style={styles.experienceRole}>
                  {[item.role, item.company].filter(Boolean).join(" • ")}
                </Text>
                <Text style={styles.muted}>
                  {[item.startDate, item.endDate || "Present"].filter(Boolean).join(" — ")}
                </Text>
                {(item.bullets || []).map((bullet, idx) => (
                  <View key={idx} style={styles.bullet}>
                    <Text style={styles.bulletSymbol}>•</Text>
                    <Text style={{ flex: 1 }}>{bullet}</Text>
                  </View>
                ))}
              </View>
            ))}
          </View>
        ) : null}

        {education.length ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Education</Text>
            {education.map((item) => (
              <View key={item.id} style={{ marginBottom: 8 }}>
                <Text style={styles.experienceRole}>
                  {[item.degree, item.institution].filter(Boolean).join(" • ")}
                </Text>
                <Text style={styles.muted}>
                  {[item.startYear, item.endYear].filter(Boolean).join(" — ")}
                </Text>
                {(item.details || []).map((detail, idx) => (
                  <View key={idx} style={styles.bullet}>
                    <Text style={styles.bulletSymbol}>•</Text>
                    <Text style={{ flex: 1 }}>{detail}</Text>
                  </View>
                ))}
              </View>
            ))}
          </View>
        ) : null}

        {skills.length ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Skills</Text>
            <View style={styles.skills}>
              {skills.map((skill, idx) => (
                <Text key={idx} style={styles.chip}>
                  {skill}
                </Text>
              ))}
            </View>
          </View>
        ) : null}

        {projects.length ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Projects</Text>
            {projects.map((project) => (
              <View key={project.id} style={{ marginBottom: 8 }}>
                <Text style={styles.experienceRole}>
                  {project.name}
                  {project.link ? ` — ${project.link}` : ""}
                </Text>
                {(project.highlights || []).map((highlight, idx) => (
                  <View key={idx} style={styles.bullet}>
                    <Text style={styles.bulletSymbol}>•</Text>
                    <Text style={{ flex: 1 }}>{highlight}</Text>
                  </View>
                ))}
              </View>
            ))}
          </View>
        ) : null}
      </Page>
    </Document>
  );
}
