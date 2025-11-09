import { NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import OpenAI from "openai";
import {
  getAdminAuth,
  getAdminDb,
} from "@/lib/firebase/admin";
import { COLLECTIONS, resumeDocPath } from "@/lib/firebase/collections";

const MAX_CHAT_HISTORY = 50;
const PROMPT_HISTORY_LIMIT = 12;
const MODEL_NAME = process.env.OPENAI_MODEL || "gpt-4o-mini";

function buildResumeSummary(resumeDoc) {
  const basics = resumeDoc.content?.basics || {};
  const experience = resumeDoc.content?.experience || [];
  const education = resumeDoc.content?.education || [];
  const skills = resumeDoc.content?.skills || [];
  const projects = resumeDoc.content?.projects || [];

  const summaryParts = [];

  if (basics.fullName || basics.headline) {
    summaryParts.push(
      `Name: ${basics.fullName || "Unknown"}`,
      `Headline: ${basics.headline || "Unknown"}`
    );
  }
  if (basics.summary) {
    summaryParts.push(`Summary: ${basics.summary}`);
  }

  if (experience?.length) {
    const expStrings = experience.map((item) => {
      const bullets = (item.bullets || []).map((bullet) => `- ${bullet}`).join("\n");
      return `${item.role || "Role"} at ${item.company || "Company"} (${item.startDate || "Start"} - ${
        item.endDate || "Present"
      })\n${bullets}`;
    });
    summaryParts.push(`Experience:\n${expStrings.join("\n")}`);
  }

  if (education?.length) {
    const eduStrings = education.map((item) => {
      const details = (item.details || []).map((detail) => `- ${detail}`).join("\n");
      return `${item.degree || "Degree"} at ${item.institution || "Institution"} (${item.startYear || "Start"}-${
        item.endYear || "End"
      })\n${details}`;
    });
    summaryParts.push(`Education:\n${eduStrings.join("\n")}`);
  }

  if (skills?.length) {
    summaryParts.push(`Skills: ${skills.join(", ")}`);
  }

  if (projects?.length) {
    const projectStrings = projects.map((project) => {
      const highlights = (project.highlights || []).map((highlight) => `- ${highlight}`).join("\n");
      return `${project.name || "Project"} ${project.link ? `(${project.link})` : ""}\n${highlights}`;
    });
    summaryParts.push(`Projects:\n${projectStrings.join("\n")}`);
  }

  return summaryParts.join("\n\n");
}

function buildSystemPrompt(resumeDoc) {
  return [
    "You are a meticulous resume writing assistant.",
    "Use only the information provided in the resume context or the user’s latest message.",
    "If the user asks for achievements or data that are missing, suggest how they might gather it instead of inventing details.",
    "Keep tone professional and concise; prefer bullet points or short paragraphs.",
    "When rewriting, mirror the style but improve clarity, quantify impact when possible, and ensure ATS-friendly language.",
    "If the user asks for general advice, provide actionable guidance.",
    "",
    "Resume context:",
    buildResumeSummary(resumeDoc) || "No resume data is available yet.",
  ].join("\n");
}

async function verifyRequest(request) {
  const authHeader = request.headers.get("authorization") || "";
  const token = authHeader.startsWith("Bearer ")
    ? authHeader.replace("Bearer ", "")
    : null;

  if (!token) {
    return null;
  }

  try {
    const adminAuth = getAdminAuth();
    return await adminAuth.verifyIdToken(token);
  } catch (error) {
    console.error("Failed to verify token", error);
    return null;
  }
}

async function fetchResumeDocument(userId, resumeId) {
  const db = getAdminDb();
  const resumeRef = db.doc(resumeDocPath(userId, resumeId));
  const snapshot = await resumeRef.get();
  if (!snapshot.exists) {
    return null;
  }
  return { ref: resumeRef, data: snapshot.data() };
}

async function fetchMessages(resumeRef, limit) {
  const historyLimit = Math.min(limit, MAX_CHAT_HISTORY);
  const snapshot = await resumeRef
    .collection(COLLECTIONS.CHATS)
    .orderBy("createdAt", "asc")
    .limit(historyLimit)
    .get();

  return snapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      role: data.role,
      content: data.content,
      createdAt: data.createdAt?.toDate
        ? data.createdAt.toDate().toISOString()
        : null,
    };
  });
}

async function pruneMessages(resumeRef) {
  const messagesRef = resumeRef.collection(COLLECTIONS.CHATS);
  const snapshot = await messagesRef
    .orderBy("createdAt", "desc")
    .offset(MAX_CHAT_HISTORY)
    .get();

  const batch = getAdminDb().batch();
  snapshot.docs.forEach((doc) => batch.delete(doc.ref));
  if (!snapshot.empty) {
    await batch.commit();
  }
}

export async function GET(request, { params }) {
  try {
    const decoded = await verifyRequest(request);
    if (!decoded) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { resumeId } = await params;
    const resumeDoc = await fetchResumeDocument(decoded.uid, resumeId);
    if (!resumeDoc) {
      return NextResponse.json({ error: "Resume not found" }, { status: 404 });
    }

    const url = new URL(request.url);
    const limit = Number(url.searchParams.get("limit")) || MAX_CHAT_HISTORY;
    const messages = await fetchMessages(
      resumeDoc.ref,
      Math.min(limit, MAX_CHAT_HISTORY)
    );

    return NextResponse.json({ messages });
  } catch (error) {
    console.error("Chat history fetch failed", error);
    return NextResponse.json(
      { error: "Failed to fetch chat history" },
      { status: 500 }
    );
  }
}

export async function POST(request, { params }) {
  try {
    const decoded = await verifyRequest(request);
    if (!decoded) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        {
          error:
            "OpenAI API key is not configured on the server. Please set OPENAI_API_KEY.",
        },
        { status: 500 }
      );
    }

    const { resumeId } = await params;
    const body = await request.json();
    const { message } = body || {};

    if (!message || typeof message !== "string") {
      return NextResponse.json(
        { error: "Message content is required." },
        { status: 400 }
      );
    }

    const resumeDoc = await fetchResumeDocument(decoded.uid, resumeId);
    if (!resumeDoc) {
      return NextResponse.json({ error: "Resume not found" }, { status: 404 });
    }

    if (resumeDoc.data.ownerId && resumeDoc.data.ownerId !== decoded.uid) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const messagesCollection = resumeDoc.ref.collection(COLLECTIONS.CHATS);

    // Persist user message
    const userMessageRef = await messagesCollection.add({
      role: "user",
      content: message.trim(),
      createdAt: FieldValue.serverTimestamp(),
    });

    // Gather history for prompt
    const priorMessagesSnapshot = await messagesCollection
      .orderBy("createdAt", "desc")
      .limit(PROMPT_HISTORY_LIMIT * 2) // user + assistant pairs
      .get();

    const ordered = priorMessagesSnapshot.docs
      .map((doc) => ({ id: doc.id, ...doc.data() }))
      .reverse();

    const chatHistory = ordered.map((entry) => ({
      role: entry.role,
      content: entry.content,
    }));

    const systemPrompt = buildSystemPrompt(resumeDoc.data);
    const parsedText = resumeDoc.data.parsedText || "";

    if (parsedText) {
      chatHistory.unshift({
        role: "system",
        content: `Additional resume text (unstructured):\n${parsedText.slice(0, 6000)}`,
      });
    }

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const completion = await openai.chat.completions.create({
      model: MODEL_NAME,
      temperature: 0.4,
      top_p: 0.9,
      presence_penalty: 0,
      frequency_penalty: 0,
      messages: [
        { role: "system", content: systemPrompt },
        ...chatHistory,
      ],
      max_tokens: 500,
    });

    const assistantContent =
      completion.choices?.[0]?.message?.content?.trim() ||
      "I’m sorry, I wasn’t able to generate a response. Please try again.";

    const assistantDoc = await messagesCollection.add({
      role: "assistant",
      content: assistantContent,
      createdAt: FieldValue.serverTimestamp(),
    });

    // Maintain history cap
    void pruneMessages(resumeDoc.ref).catch((error) =>
      console.warn("Failed to prune chat history", error)
    );

    return NextResponse.json({
      userMessage: {
        id: userMessageRef.id,
        role: "user",
        content: message.trim(),
      },
      assistantMessage: {
        id: assistantDoc.id,
        role: "assistant",
        content: assistantContent,
      },
    });
  } catch (error) {
    console.error("Chat request failed", error);
    const status = error.status ?? 500;
    const message =
      error.message || "The assistant encountered a problem. Please try again.";
    return NextResponse.json({ error: message }, { status });
  }
}
