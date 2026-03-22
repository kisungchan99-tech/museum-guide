import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error("Supabase environment variables are required");
}

// Input validation schemas
const childrenSchema = z.object({
  mode: z.literal("children"),
  childrenAges: z.string().min(1).max(100),
  interests: z.string().max(200).optional().default(""),
  preferredRegion: z.string().max(50).optional().default(""),
});

const travelSchema = z.object({
  mode: z.literal("travel"),
  destination: z.string().min(1).max(100),
});

const requestSchema = z.discriminatedUnion("mode", [childrenSchema, travelSchema]);

// Simple in-memory rate limiter
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 5; // max requests
const RATE_WINDOW = 60 * 1000; // per minute

function isRateLimited(userId: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(userId);

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(userId, { count: 1, resetAt: now + RATE_WINDOW });
    return false;
  }

  if (entry.count >= RATE_LIMIT) {
    return true;
  }

  rateLimitMap.set(userId, { ...entry, count: entry.count + 1 });
  return false;
}

export async function POST(request: Request) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "AI API key not configured" },
      { status: 500 }
    );
  }

  // Auth check
  const authHeader = request.headers.get("Authorization");
  if (!authHeader) {
    return NextResponse.json({ error: "로그인이 필요합니다" }, { status: 401 });
  }

  const supabase = createClient(supabaseUrl!, supabaseKey!, {
    global: { headers: { Authorization: authHeader } },
  });

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: "인증에 실패했습니다" }, { status: 401 });
  }

  // Rate limiting
  if (isRateLimited(user.id)) {
    return NextResponse.json(
      { error: "요청이 너무 많습니다. 1분 후 다시 시도해주세요." },
      { status: 429 }
    );
  }

  // Input validation
  let body;
  try {
    body = requestSchema.parse(await request.json());
  } catch {
    return NextResponse.json(
      { error: "잘못된 요청입니다" },
      { status: 400 }
    );
  }

  // Fetch museums from DB for context
  const { data: museums } = await supabase
    .from("museums")
    .select("name, address, category, hours, price, description, region, target_age_min, target_age_max");

  const { data: programs } = await supabase
    .from("programs")
    .select("name, target_age, schedule, price, description, museums(name)");

  const museumContext = JSON.stringify(museums, null, 2);
  const programContext = JSON.stringify(programs, null, 2);

  let userPrompt = "";

  if (body.mode === "children") {
    userPrompt = `자녀 나이: ${body.childrenAges}세
관심 분야: ${body.interests || "특별한 선호 없음"}
선호 지역: ${body.preferredRegion || "전국"}

위 조건에 맞는 박물관 3~5개를 추천해주세요. 각 박물관마다:
1. 박물관 이름
2. 추천 이유 (아이 나이에 맞는 이유)
3. 관람 팁 (소요 시간, 준비물, 주의사항 등)
4. 추천 교육 프로그램 (있다면)
을 포함해주세요.`;
  } else {
    userPrompt = `여행 목적지: ${body.destination}

위 여행지 근처의 박물관을 추천해주세요:
1. 근처 박물관 3~5개 추천
2. 각 박물관 추천 이유
3. 효율적인 방문 동선 제안
4. 소요 시간 예상
을 포함해주세요.`;
  }

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1500,
        messages: [
          {
            role: "user",
            content: `당신은 한국 박물관 전문 큐레이터입니다. 초중고 자녀를 둔 부모에게 박물관을 추천합니다.

아래는 우리가 보유한 박물관 데이터입니다:
${museumContext}

교육 프로그램 데이터:
${programContext}

위 데이터에 있는 박물관 중에서만 추천해주세요.

${userPrompt}

답변은 한국어로, 친근하고 실용적인 톤으로 작성해주세요.`,
          },
        ],
      }),
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: "AI 추천 생성에 실패했습니다" },
        { status: 500 }
      );
    }

    const data = await response.json();
    const recommendation = data?.content?.[0]?.text ?? "추천 결과를 생성하지 못했습니다.";

    return NextResponse.json({ recommendation });
  } catch {
    return NextResponse.json(
      { error: "서버 오류가 발생했습니다" },
      { status: 500 }
    );
  }
}
