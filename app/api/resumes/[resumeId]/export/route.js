import { Buffer } from "node:buffer";
import { NextResponse } from "next/server";
import { pdf } from "@react-pdf/renderer";
import { getAdminAuth, getAdminDb } from "@/lib/firebase/admin";
import { resumeDocPath } from "@/lib/firebase/collections";
import { ResumeDocument } from "@/components/export/resume-pdf";

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
    console.error("Export token verification failed", error);
    return null;
  }
}

async function fetchResume(userId, resumeId) {
  const db = getAdminDb();
  const ref = db.doc(resumeDocPath(userId, resumeId));
  const snapshot = await ref.get();
  if (!snapshot.exists) {
    return null;
  }
  return snapshot.data();
}

export async function GET(request, { params }) {
  try {
    const decoded = await verifyRequest(request);
    if (!decoded) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { resumeId } = await params;
    const resume = await fetchResume(decoded.uid, resumeId);
    if (!resume) {
      return NextResponse.json({ error: "Resume not found" }, { status: 404 });
    }

    if (resume.ownerId && resume.ownerId !== decoded.uid) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const pdfInstance = pdf(<ResumeDocument resume={resume} />);
    const pdfStream = await new Promise((resolve, reject) => {
      pdfInstance.toBuffer((buffer) => {
        if (!buffer) {
          reject(new Error("Failed to generate PDF buffer"));
        } else {
          resolve(buffer);
        }
      });
    });

    const safeName =
      resume.content?.basics?.fullName?.toLowerCase().replace(/\s+/g, "-") ||
      "resume";
    const fileName = `${safeName}-${resumeId}.pdf`;

    return new NextResponse(Buffer.from(pdfStream), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${fileName}"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("Export failed", error);
    return NextResponse.json(
      { error: "Failed to export resume." },
      { status: 500 }
    );
  }
}
