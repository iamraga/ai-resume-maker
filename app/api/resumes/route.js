import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET() {
  return NextResponse.json(
    { message: "List resumes not yet implemented." },
    { status: 501 }
  );
}

export async function POST() {
  return NextResponse.json(
    { message: "Create resume not yet implemented." },
    { status: 501 }
  );
}
