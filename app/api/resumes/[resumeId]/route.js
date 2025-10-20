import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET(request, { params }) {
  const { resumeId } = params;
  if (!resumeId) {
    return NextResponse.json(
      { error: "Missing resumeId parameter." },
      { status: 400 }
    );
  }

  return NextResponse.json(
    { message: "Fetch resume not yet implemented." },
    { status: 501 }
  );
}

export async function PUT(request, { params }) {
  const { resumeId } = params;
  if (!resumeId) {
    return NextResponse.json(
      { error: "Missing resumeId parameter." },
      { status: 400 }
    );
  }

  return NextResponse.json(
    { message: "Update resume not yet implemented." },
    { status: 501 }
  );
}
