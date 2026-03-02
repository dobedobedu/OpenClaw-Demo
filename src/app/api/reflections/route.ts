import { NextResponse } from "next/server";
import { getReflections } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const agent = searchParams.get("agent") || undefined;
    const date = searchParams.get("date") || undefined;
    return NextResponse.json(getReflections(agent, date));
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
