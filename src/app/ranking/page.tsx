"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type RankingEntry = {
  user_id: string;
  nickname: string;
  visit_count: number;
  category_count: number;
};

export default function RankingPage() {
  const [rankings, setRankings] = useState<RankingEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const { data: authData } = await supabase.auth.getUser();
      setUserId(authData.user?.id ?? null);

      // Get all profiles
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, nickname") as { data: { user_id: string; nickname: string }[] | null };

      // Get all visits with museum info
      const { data: visits } = await supabase
        .from("visits")
        .select("user_id, museums(category)") as { data: { user_id: string; museums: { category: string } | null }[] | null };

      if (!profiles || !visits) {
        setLoading(false);
        return;
      }

      // Calculate rankings
      const rankMap = new Map<string, { visitCount: number; categories: Set<string>; nickname: string }>();

      for (const profile of profiles) {
        rankMap.set(profile.user_id, {
          visitCount: 0,
          categories: new Set(),
          nickname: profile.nickname || "익명 가족",
        });
      }

      for (const visit of visits) {
        const entry = rankMap.get(visit.user_id);
        if (entry) {
          entry.visitCount++;
          if (visit.museums?.category) {
            entry.categories.add(visit.museums.category);
          }
        }
      }

      const rankingList: RankingEntry[] = Array.from(rankMap.entries())
        .map(([uid, data]) => ({
          user_id: uid,
          nickname: data.nickname,
          visit_count: data.visitCount,
          category_count: data.categories.size,
        }))
        .filter((r) => r.visit_count > 0)
        .sort((a, b) => b.visit_count - a.visit_count || b.category_count - a.category_count);

      setRankings(rankingList);
      setLoading(false);
    }

    load();
  }, []);

  const medals = ["🥇", "🥈", "🥉"];

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="text-2xl font-bold text-zinc-900">가족 랭킹</h1>
      <p className="mt-2 text-sm text-zinc-500">
        박물관을 많이 방문하고 다양한 카테고리를 탐험한 가족이 상위에 올라갑니다
      </p>

      {loading ? (
        <div className="mt-6 space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 animate-pulse rounded-lg bg-zinc-200" />
          ))}
        </div>
      ) : rankings.length === 0 ? (
        <div className="mt-12 flex flex-col items-center text-center">
          <p className="text-4xl">🏛️</p>
          <p className="mt-4 text-lg font-medium text-zinc-500">아직 방문 기록이 없습니다</p>
          <p className="mt-1 text-sm text-zinc-400">박물관을 방문하고 기록을 남겨보세요!</p>
        </div>
      ) : (
        <div className="mt-6 space-y-3">
          {rankings.map((entry, index) => {
            const isMe = entry.user_id === userId;
            return (
              <div
                key={entry.user_id}
                className={`flex items-center gap-4 rounded-xl border p-4 ${
                  isMe
                    ? "border-blue-300 bg-blue-50"
                    : "border-zinc-200 bg-white"
                }`}
              >
                <span className="w-8 text-center text-lg font-bold">
                  {index < 3 ? medals[index] : `${index + 1}`}
                </span>
                <div className="flex-1">
                  <p className="font-semibold text-zinc-900">
                    {entry.nickname}
                    {isMe && (
                      <span className="ml-2 rounded-full bg-blue-100 px-2 py-0.5 text-xs text-blue-600">
                        나
                      </span>
                    )}
                  </p>
                  <p className="text-xs text-zinc-500">
                    카테고리 {entry.category_count}개 분야 탐험
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-blue-600">{entry.visit_count}</p>
                  <p className="text-xs text-zinc-400">방문</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
