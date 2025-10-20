import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(req) {
  try {
    const body = await req.json();
    const { messages, resumeId } = body || {};

    if (!Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: "Chat request must include at least one message." },
        { status: 400 }
      );
    }

    if (!resumeId) {
      return NextResponse.json(
        { error: "Chat request must include resumeId." },
        { status: 400 }
      );
    }

    // Placeholder for OpenAI integration.
    return NextResponse.json(
      {
        message: "Chat endpoint not yet implemented.",
      },
      { status: 501 }
    );
  } catch (error) {
    console.error("[chat] error", error);
    return NextResponse.json(
      { error: "Unexpected server error." },
      { status: 500 }
    );
  }
}
