import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(req) {
  try {
    const contentType = req.headers.get("content-type") || "";
    if (!contentType.includes("multipart/form-data")) {
      return NextResponse.json(
        { error: "Expected multipart/form-data payload." },
        { status: 400 }
      );
    }

    // Placeholder for parsing logic. We'll implement PDF/DOCX extraction later.
    return NextResponse.json(
      {
        message: "Upload endpoint not yet implemented.",
      },
      { status: 501 }
    );
  } catch (error) {
    console.error("[upload] error", error);
    return NextResponse.json(
      { error: "Unexpected server error." },
      { status: 500 }
    );
  }
}
