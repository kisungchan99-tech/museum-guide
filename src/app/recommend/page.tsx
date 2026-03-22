"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function RecommendPage() {
  const [mode, setMode] = useState<"children" | "travel">("children");

  // Children mode
  const [childrenAges, setChildrenAges] = useState("");
  const [interests, setInterests] = useState("");
  const [preferredRegion, setPreferredRegion] = useState("");

  // Travel mode
  const [destination, setDestination] = useState("");

  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setResult("");

    try {
      const body =
        mode === "children"
          ? { mode, childrenAges, interests, preferredRegion }
          : { mode, destination };

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setResult("로그인이 필요합니다. 로그인 후 다시 시도해주세요.");
        return;
      }

      const res = await fetch("/api/recommend", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        setResult(data.error ?? "추천 요청에 실패했습니다.");
        return;
      }

      setResult(data.recommendation);
    } catch {
      setResult("추천을 가져오는 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="text-2xl font-bold text-zinc-900">AI 맞춤 추천</h1>
      <p className="mt-2 text-sm text-zinc-500">
        Claude AI가 우리 가족에게 딱 맞는 박물관을 추천해드려요
      </p>

      {/* Mode toggle */}
      <div className="mt-6 flex gap-2 rounded-lg bg-zinc-100 p-1">
        <button
          onClick={() => setMode("children")}
          className={`flex-1 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
            mode === "children"
              ? "bg-white text-zinc-900 shadow-sm"
              : "text-zinc-500 hover:text-zinc-700"
          }`}
        >
          👶 자녀 맞춤 추천
        </button>
        <button
          onClick={() => setMode("travel")}
          className={`flex-1 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
            mode === "travel"
              ? "bg-white text-zinc-900 shadow-sm"
              : "text-zinc-500 hover:text-zinc-700"
          }`}
        >
          🧳 여행지 근처 추천
        </button>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
        {mode === "children" ? (
          <>
            <div>
              <label className="mb-1 block text-sm font-medium text-zinc-700">
                자녀 나이 (쉼표로 구분)
              </label>
              <input
                type="text"
                value={childrenAges}
                onChange={(e) => setChildrenAges(e.target.value)}
                placeholder="예: 7, 10"
                required
                className="w-full rounded-lg border border-zinc-300 px-4 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-zinc-700">
                관심 분야 (선택)
              </label>
              <input
                type="text"
                value={interests}
                onChange={(e) => setInterests(e.target.value)}
                placeholder="예: 과학, 공룡, 우주, 역사"
                className="w-full rounded-lg border border-zinc-300 px-4 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-zinc-700">
                선호 지역 (선택)
              </label>
              <input
                type="text"
                value={preferredRegion}
                onChange={(e) => setPreferredRegion(e.target.value)}
                placeholder="예: 서울, 경기"
                className="w-full rounded-lg border border-zinc-300 px-4 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </>
        ) : (
          <div>
            <label className="mb-1 block text-sm font-medium text-zinc-700">
              여행 목적지
            </label>
            <input
              type="text"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              placeholder="예: 경주, 제주, 전주"
              required
              className="w-full rounded-lg border border-zinc-300 px-4 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="mt-2 rounded-lg bg-blue-600 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "AI가 추천 중..." : "추천 받기"}
        </button>
      </form>

      {/* Result */}
      {result && (
        <div className="mt-8 rounded-xl border border-zinc-200 bg-white p-6">
          <h2 className="mb-4 text-lg font-bold text-zinc-900">추천 결과</h2>
          <div className="whitespace-pre-wrap text-sm leading-relaxed text-zinc-700">
            {result}
          </div>
        </div>
      )}
    </div>
  );
}
