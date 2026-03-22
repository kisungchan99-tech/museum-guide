"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Props = {
  museumId: string;
};

export default function VisitButton({ museumId }: Props) {
  const [userId, setUserId] = useState<string | null>(null);
  const [visited, setVisited] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [visitDate, setVisitDate] = useState(new Date().toISOString().split("T")[0]);
  const [memo, setMemo] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function check() {
      const { data: authData } = await supabase.auth.getUser();
      const uid = authData.user?.id ?? null;
      setUserId(uid);

      if (uid) {
        const { data } = await supabase
          .from("visits")
          .select("id")
          .eq("museum_id", museumId)
          .eq("user_id", uid)
          .limit(1);

        setVisited((data?.length ?? 0) > 0);
      }
    }

    check();
  }, [museumId]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!userId) return;

    setSubmitting(true);

    const { error } = await supabase.from("visits").insert({
      museum_id: museumId,
      user_id: userId,
      visited_at: visitDate,
      memo: memo.trim(),
    });

    if (error) {
      console.error("Visit insert error:", error);
      alert("방문 기록 저장에 실패했습니다.");
    } else {
      setVisited(true);
      setShowForm(false);
      setMemo("");
    }

    setSubmitting(false);
  }

  if (!userId) return null;

  if (visited) {
    return (
      <div className="flex items-center gap-2 rounded-lg bg-green-50 px-4 py-3 text-sm text-green-700">
        <span className="text-lg">✅</span>
        <span className="font-medium">방문 완료!</span>
      </div>
    );
  }

  return (
    <div>
      {showForm ? (
        <form onSubmit={handleSubmit} className="rounded-lg border border-zinc-200 bg-white p-4">
          <p className="mb-3 text-sm font-semibold text-zinc-700">방문 기록 남기기</p>
          <div className="flex flex-col gap-3">
            <div>
              <label className="mb-1 block text-xs text-zinc-500">방문 날짜</label>
              <input
                type="date"
                value={visitDate}
                onChange={(e) => setVisitDate(e.target.value)}
                className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm text-zinc-900 focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-zinc-500">메모 (선택)</label>
              <input
                type="text"
                value={memo}
                onChange={(e) => setMemo(e.target.value)}
                placeholder="간단한 소감을 남겨보세요"
                className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="flex-1 rounded-lg border border-zinc-300 py-2 text-sm text-zinc-600 hover:bg-zinc-50"
              >
                취소
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 rounded-lg bg-green-600 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50"
              >
                {submitting ? "저장 중..." : "기록하기"}
              </button>
            </div>
          </div>
        </form>
      ) : (
        <button
          onClick={() => setShowForm(true)}
          className="w-full rounded-lg bg-green-600 py-3 text-sm font-medium text-white hover:bg-green-700 transition-colors"
        >
          🏛️ 다녀왔어요!
        </button>
      )}
    </div>
  );
}
