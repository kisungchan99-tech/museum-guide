"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import type { Museum, Visit } from "@/types/database";
import { CATEGORY_LABELS } from "@/types/database";
import Link from "next/link";

type VisitWithMuseum = Visit & { museums: Museum };

export default function MyMapPage() {
  const [visits, setVisits] = useState<VisitWithMuseum[]>([]);
  const [allMuseums, setAllMuseums] = useState<Museum[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const { data: authData } = await supabase.auth.getUser();
      const uid = authData.user?.id ?? null;
      setUserId(uid);

      const { data: museums } = await supabase.from("museums").select("*");
      setAllMuseums(museums ?? []);

      if (uid) {
        const { data: visitData } = await supabase
          .from("visits")
          .select("*, museums(*)")
          .eq("user_id", uid)
          .order("visited_at", { ascending: false });

        setVisits((visitData as VisitWithMuseum[]) ?? []);
      }

      setLoading(false);
    }

    load();
  }, []);

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-8">
        <div className="h-96 animate-pulse rounded-xl bg-zinc-200" />
      </div>
    );
  }

  if (!userId) {
    return (
      <div className="mx-auto flex max-w-4xl flex-col items-center px-4 py-16">
        <p className="text-lg font-medium text-zinc-500">로그인이 필요합니다</p>
        <Link href="/auth" className="mt-4 rounded-lg bg-blue-600 px-6 py-2 text-sm font-medium text-white hover:bg-blue-700">
          로그인하기
        </Link>
      </div>
    );
  }

  const visitedMuseumIds = new Set(visits.map((v) => v.museum_id));
  const visitedCount = visitedMuseumIds.size;
  const totalCount = allMuseums.length;

  // Category stats
  const categoryStats: Record<string, { visited: number; total: number }> = {};
  for (const m of allMuseums) {
    if (!categoryStats[m.category]) {
      categoryStats[m.category] = { visited: 0, total: 0 };
    }
    categoryStats[m.category].total++;
    if (visitedMuseumIds.has(m.id)) {
      categoryStats[m.category].visited++;
    }
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="text-2xl font-bold text-zinc-900">내 방문 지도</h1>

      {/* Stats */}
      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-xl border border-zinc-200 bg-white p-4 text-center">
          <p className="text-2xl font-bold text-blue-600">{visitedCount}</p>
          <p className="text-xs text-zinc-500">방문한 박물관</p>
        </div>
        <div className="rounded-xl border border-zinc-200 bg-white p-4 text-center">
          <p className="text-2xl font-bold text-zinc-400">{totalCount - visitedCount}</p>
          <p className="text-xs text-zinc-500">미방문</p>
        </div>
        <div className="rounded-xl border border-zinc-200 bg-white p-4 text-center">
          <p className="text-2xl font-bold text-green-600">
            {totalCount > 0 ? Math.round((visitedCount / totalCount) * 100) : 0}%
          </p>
          <p className="text-xs text-zinc-500">달성률</p>
        </div>
        <div className="rounded-xl border border-zinc-200 bg-white p-4 text-center">
          <p className="text-2xl font-bold text-amber-600">
            {Object.values(categoryStats).filter((s) => s.visited > 0).length}
          </p>
          <p className="text-xs text-zinc-500">카테고리 정복</p>
        </div>
      </div>

      {/* Category breakdown */}
      <div className="mt-6">
        <h2 className="text-lg font-semibold text-zinc-900">카테고리별 현황</h2>
        <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {Object.entries(categoryStats).map(([cat, stats]) => (
            <div key={cat} className="rounded-lg border border-zinc-200 bg-white p-3">
              <p className="text-sm font-medium text-zinc-700">
                {CATEGORY_LABELS[cat as keyof typeof CATEGORY_LABELS]}
              </p>
              <div className="mt-2 h-2 w-full rounded-full bg-zinc-100">
                <div
                  className="h-2 rounded-full bg-blue-500 transition-all"
                  style={{ width: `${stats.total > 0 ? (stats.visited / stats.total) * 100 : 0}%` }}
                />
              </div>
              <p className="mt-1 text-xs text-zinc-400">
                {stats.visited}/{stats.total}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Museum grid with visit status */}
      <div className="mt-8">
        <h2 className="text-lg font-semibold text-zinc-900">전체 박물관</h2>
        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {allMuseums.map((museum) => {
            const visited = visitedMuseumIds.has(museum.id);
            const visit = visits.find((v) => v.museum_id === museum.id);
            return (
              <Link
                key={museum.id}
                href={`/museums/${museum.id}`}
                className={`flex items-center gap-3 rounded-lg border p-3 transition-colors ${
                  visited
                    ? "border-green-200 bg-green-50 hover:border-green-300"
                    : "border-zinc-200 bg-white hover:border-zinc-300"
                }`}
              >
                <span className="text-2xl">{visited ? "✅" : "⬜"}</span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-zinc-900">{museum.name}</p>
                  <p className="text-xs text-zinc-500">{museum.region}</p>
                  {visit && (
                    <p className="text-xs text-green-600">
                      {new Date(visit.visited_at).toLocaleDateString("ko-KR")} 방문
                    </p>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
