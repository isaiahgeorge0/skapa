import { NextResponse } from "next/server";
import {
  processLeadSubmission,
  type SubmitLeadInput,
} from "@/lib/submit-lead-core";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { success: false, error: "Invalid request body." },
      { status: 400 },
    );
  }

  const result = await processLeadSubmission(body as SubmitLeadInput);
  return NextResponse.json(result, { status: result.success ? 200 : 400 });
}
