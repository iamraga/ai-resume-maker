import { NextResponse } from "next/server";
import { Buffer } from "node:buffer";
import { FieldValue } from "firebase-admin/firestore";
import { getAdminAuth, getAdminDb, getAdminStorage } from "@/lib/firebase/admin";
import { COLLECTIONS } from "@/lib/firebase/collections";

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPES = new Set(["application/pdf"]);
const MAX_PARSED_TEXT_LENGTH = 20000;

function buildResumeDocPath(userId, resumeId) {
  return `${COLLECTIONS.RESUMES}/${userId}/items/${resumeId}`;
}

function sanitizeFileName(name) {
  return name.replace(/[^\w.\-]+/g, "-");
}

async function extractTextFromBuffer(buffer, mimeType) {
  if (mimeType !== "application/pdf") {
    return "";
  }
  try {
    const { default: pdfParse } = await import("pdf-parse");
    const parsed = await pdfParse(buffer);
    const cleaned = parsed.text
      ?.replace(/\r\n/g, "\n")
      .replace(/\t+/g, " ")
      .replace(/\u0000/g, "")
      .replace(/\n{3,}/g, "\n\n")
      .trim();
    if (!cleaned) {
      return "";
    }
    if (cleaned.length > MAX_PARSED_TEXT_LENGTH) {
      return cleaned.slice(0, MAX_PARSED_TEXT_LENGTH);
    }
    return cleaned;
  } catch (error) {
    console.error("Failed to parse PDF", error);
    return "";
  }
}

export async function POST(request, { params }) {
  try {
    const { resumeId } = params;
    if (!resumeId) {
      return NextResponse.json(
        { error: "Missing resume identifier." },
        { status: 400 }
      );
    }

    const authHeader = request.headers.get("authorization") || "";
    const token = authHeader.startsWith("Bearer ")
      ? authHeader.replace("Bearer ", "")
      : null;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const adminAuth = getAdminAuth();
    const decoded = await adminAuth.verifyIdToken(token);
    const userId = decoded.uid;

    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json(
        { error: "No file provided." },
        { status: 400 }
      );
    }

    if (!ALLOWED_TYPES.has(file.type)) {
      return NextResponse.json(
        { error: "Unsupported file type. Only PDF files are supported at this time." },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "File exceeds the 5 MB limit." },
        { status: 400 }
      );
    }

    const db = getAdminDb();
    const resumeRef = db.doc(buildResumeDocPath(userId, resumeId));
    const resumeSnap = await resumeRef.get();

    if (!resumeSnap.exists) {
      return NextResponse.json(
        { error: "Resume not found." },
        { status: 404 }
      );
    }

    const resumeData = resumeSnap.data();
    if (resumeData.ownerId && resumeData.ownerId !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const storage = getAdminStorage().bucket();

    if (resumeData.filePath) {
      try {
        await storage.file(resumeData.filePath).delete();
      } catch (error) {
        console.warn("Failed to remove previous resume upload", error);
      }
    }

    const sanitizedName = sanitizeFileName(file.name);
    const storagePath = `uploads/${userId}/${resumeId}/${Date.now()}-${sanitizedName}`;
    const fileRef = storage.file(storagePath);
    await fileRef.save(buffer, {
      contentType: file.type,
      resumable: false,
    });

    const parsedText = await extractTextFromBuffer(buffer, file.type);

    await resumeRef.update({
      fileName: file.name,
      fileType: file.type,
      fileSize: file.size,
      filePath: storagePath,
      fileURL: "",
      parsedText,
      uploadedAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });

    return NextResponse.json({
      fileName: file.name,
      fileType: file.type,
      fileSize: file.size,
      filePath: storagePath,
      parsedText,
      uploadedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("File upload failed", error);
    return NextResponse.json(
      { error: "Failed to process upload." },
      { status: 500 }
    );
  }
}
