"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import type { Review } from "@/types/database";

type Props = {
  museumId: string;
};

export default function ReviewSection({ museumId }: Props) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  // Review form state
  const [rating, setRating] = useState(5);
  const [content, setContent] = useState("");
  const [childAge, setChildAge] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    fetchReviews();
    checkAuth();
    const cleanup = subscribeToReviews();
    return cleanup;
  }, [museumId]);

  async function checkAuth() {
    const { data } = await supabase.auth.getUser();
    setUserId(data.user?.id ?? null);
  }

  async function fetchReviews() {
    const { data, error } = await supabase
      .from("reviews")
      .select("*")
      .eq("museum_id", museumId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Reviews fetch error:", error);
      return;
    }

    setReviews(data ?? []);
    setLoading(false);
  }

  function subscribeToReviews() {
    const channel = supabase
      .channel(`reviews:${museumId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "reviews", filter: `museum_id=eq.${museumId}` },
        () => {
          fetchReviews();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!userId) {
      alert("로그인이 필요합니다.");
      return;
    }

    if (!content.trim()) {
      alert("리뷰 내용을 입력해주세요.");
      return;
    }

    setSubmitting(true);

    if (editingId) {
      const parsedAge = childAge ? Number(childAge) : null;
      const { error } = await supabase
        .from("reviews")
        .update({
          rating,
          content: content.trim(),
          child_age: parsedAge && !isNaN(parsedAge) ? parsedAge : null,
        })
        .eq("id", editingId)
        .eq("user_id", userId);

      if (error) {
        console.error("Review update error:", error);
        alert("리뷰 수정에 실패했습니다.");
      }

      setEditingId(null);
    } else {
      const parsedInsertAge = childAge ? Number(childAge) : null;
      const { error } = await supabase.from("reviews").insert({
        museum_id: museumId,
        user_id: userId,
        rating,
        content: content.trim(),
        child_age: parsedInsertAge && !isNaN(parsedInsertAge) ? parsedInsertAge : null,
      });

      if (error) {
        console.error("Review insert error:", error);
        alert("리뷰 작성에 실패했습니다.");
      }
    }

    setRating(5);
    setContent("");
    setChildAge("");
    setSubmitting(false);
    fetchReviews();
  }

  function handleEdit(review: Review) {
    setEditingId(review.id);
    setRating(review.rating);
    setContent(review.content);
    setChildAge(review.child_age?.toString() ?? "");
  }

  async function handleDelete(reviewId: string) {
    if (!confirm("리뷰를 삭제하시겠습니까?")) return;

    const { error } = await supabase.from("reviews").delete().eq("id", reviewId);

    if (error) {
      console.error("Review delete error:", error);
      alert("리뷰 삭제에 실패했습니다.");
      return;
    }

    fetchReviews();
  }

  const averageRating =
    reviews.length > 0
      ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
      : null;

  return (
    <div className="mt-4">
      {/* Average rating */}
      {averageRating && (
        <div className="mb-4 flex items-center gap-2">
          <span className="text-2xl font-bold text-yellow-500">{"★".repeat(Math.round(Number(averageRating)))}</span>
          <span className="text-lg font-semibold text-zinc-900">{averageRating}</span>
          <span className="text-sm text-zinc-400">({reviews.length}개 리뷰)</span>
        </div>
      )}

      {/* Review form */}
      {userId ? (
        <form onSubmit={handleSubmit} className="mb-6 rounded-lg border border-zinc-200 bg-white p-4">
          <p className="mb-3 text-sm font-semibold text-zinc-700">
            {editingId ? "리뷰 수정" : "리뷰 작성"}
          </p>

          {/* Star rating */}
          <div className="mb-3 flex gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                className={`text-2xl ${star <= rating ? "text-yellow-400" : "text-zinc-300"}`}
              >
                ★
              </button>
            ))}
          </div>

          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="방문 후기를 남겨주세요..."
            className="mb-3 w-full rounded-lg border border-zinc-300 p-3 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            rows={3}
          />

          <div className="flex items-center gap-3">
            <input
              type="number"
              value={childAge}
              onChange={(e) => setChildAge(e.target.value)}
              placeholder="자녀 나이"
              min={1}
              max={18}
              className="w-24 rounded-lg border border-zinc-300 px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-blue-500 focus:outline-none"
            />
            <span className="text-xs text-zinc-400">세</span>
            <div className="flex-1" />
            {editingId && (
              <button
                type="button"
                onClick={() => {
                  setEditingId(null);
                  setRating(5);
                  setContent("");
                  setChildAge("");
                }}
                className="rounded-lg px-4 py-2 text-sm text-zinc-500 hover:bg-zinc-100"
              >
                취소
              </button>
            )}
            <button
              type="submit"
              disabled={submitting}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {submitting ? "저장 중..." : editingId ? "수정" : "등록"}
            </button>
          </div>
        </form>
      ) : (
        <div className="mb-6 rounded-lg border border-zinc-200 bg-zinc-50 p-4 text-center">
          <p className="text-sm text-zinc-500">
            리뷰를 작성하려면{" "}
            <a href="/auth" className="text-blue-600 hover:underline">
              로그인
            </a>
            이 필요합니다.
          </p>
        </div>
      )}

      {/* Review list */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <div key={i} className="h-24 animate-pulse rounded-lg bg-zinc-200" />
          ))}
        </div>
      ) : reviews.length === 0 ? (
        <p className="text-center text-sm text-zinc-400 py-8">아직 리뷰가 없습니다. 첫 리뷰를 남겨보세요!</p>
      ) : (
        <div className="space-y-3">
          {reviews.map((review) => (
            <div key={review.id} className="rounded-lg border border-zinc-200 bg-white p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-yellow-400">{"★".repeat(review.rating)}</span>
                  {review.child_age && (
                    <span className="rounded-full bg-blue-50 px-2 py-0.5 text-xs text-blue-600">
                      {review.child_age}세 자녀
                    </span>
                  )}
                </div>
                {userId === review.user_id && (
                  <div className="flex gap-2">
                    <button onClick={() => handleEdit(review)} className="text-xs text-zinc-400 hover:text-blue-600">
                      수정
                    </button>
                    <button onClick={() => handleDelete(review.id)} className="text-xs text-zinc-400 hover:text-red-500">
                      삭제
                    </button>
                  </div>
                )}
              </div>
              <p className="mt-2 text-sm text-zinc-700">{review.content}</p>
              <p className="mt-2 text-xs text-zinc-400">
                {new Date(review.created_at).toLocaleDateString("ko-KR")}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
