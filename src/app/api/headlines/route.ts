import { NextResponse } from "next/server";
import {
  getHeadlines,
  getMissingHeadlineDates,
  getReflectionWithPredictions,
  saveHeadline,
} from "@/lib/db";

const NVIDIA_API_KEY = process.env.NVIDIA_API_KEY;
const NVIDIA_URL = "https://integrate.api.nvidia.com/v1/chat/completions";
const MODEL = "deepseek-ai/deepseek-v3.2";

const AGENT_NAMES: Record<string, string> = {
  john: "John",
  paul: "Paul",
  george: "George",
  ringo: "Ringo",
};

export const dynamic = "force-dynamic";

async function generateHeadline(
  agentId: string,
  date: string
): Promise<string | null> {
  if (!NVIDIA_API_KEY) return null;

  const { reflection, predictions } = getReflectionWithPredictions(
    agentId,
    date
  );
  if (!reflection) return null;

  const name = AGENT_NAMES[agentId] ?? agentId;
  const isGoodDay = reflection.correct_count > reflection.total_count / 2;

  const predSummary = predictions
    .map(
      (p) =>
        `${p.ticker} ${p.direction} (${p.confidence}%) → ${p.correct ? "correct" : "wrong"}${p.actual_change_pct != null ? ` (actual: ${p.actual_change_pct > 0 ? "+" : ""}${p.actual_change_pct.toFixed(2)}%)` : ""}`
    )
    .join("; ");

  const prompt = `You write punchy one-liner headlines for a stock prediction competition dashboard — like ESPN ticker meets Bloomberg Terminal.

Agent "${name}" went ${reflection.correct_count}/${reflection.total_count} on ${date}.
Predictions: ${predSummary}
${isGoodDay ? `What worked: ${reflection.what_went_well}` : `What went wrong: ${reflection.what_went_wrong}`}

Write ONE headline (max 15 words). Be specific — mention tickers, sectors, or market events. No generic phrases. Make it sound like a sports commentator narrating a trading floor. Do NOT use quotes. Just the headline text.`;

  const res = await fetch(NVIDIA_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${NVIDIA_API_KEY}`,
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [{ role: "user", content: prompt }],
      max_tokens: 60,
      temperature: 0.9,
    }),
  });

  if (!res.ok) return null;
  const data = await res.json();
  const text = data.choices?.[0]?.message?.content?.trim();
  return text || null;
}

export async function GET() {
  try {
    // Check for missing headlines and generate them
    const missing = getMissingHeadlineDates();

    if (missing.length > 0 && NVIDIA_API_KEY) {
      // Generate up to 8 at a time to avoid long requests
      const batch = missing.slice(0, 8);
      await Promise.all(
        batch.map(async ({ agent_id, date }) => {
          const headline = await generateHeadline(agent_id, date);
          if (headline) {
            saveHeadline(agent_id, date, headline);
          }
        })
      );
    }

    return NextResponse.json(getHeadlines());
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
