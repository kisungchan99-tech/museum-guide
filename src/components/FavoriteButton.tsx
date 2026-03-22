"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Props = {
  museumId: string;
};

export default function FavoriteButton({ museumId }: Props) {
  const [userId, setUserId] = useState<string | null>(null);
  const [favorited, setFavorited] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function check() {
      const { data: authData } = await supabase.auth.getUser();
      const uid = authData.user?.id ?? null;
      setUserId(uid);

      if (uid) {
        const { data } = await supabase
          .from("favorites")
          .select("id")
          .eq("museum_id", museumId)
          .eq("user_id", uid)
          .limit(1);

        setFavorited((data?.length ?? 0) > 0);
      }
    }

    check();
  }, [museumId]);

  async function toggleFavorite() {
    if (!userId) {
      alert("로그인이 필요합니다.");
      return;
    }

    setLoading(true);

    if (favorited) {
      const { error } = await supabase
        .from("favorites")
        .delete()
        .eq("museum_id", museumId)
        .eq("user_id", userId);
      if (!error) setFavorited(false);
    } else {
      const { error } = await supabase.from("favorites").insert({
        museum_id: museumId,
        user_id: userId,
      });
      if (!error) setFavorited(true);
    }

    setLoading(false);
  }

  if (!userId) return null;

  return (
    <button
      onClick={toggleFavorite}
      disabled={loading}
      className={`flex items-center gap-2 rounded-lg border px-4 py-3 text-sm font-medium transition-colors ${
        favorited
          ? "border-red-200 bg-red-50 text-red-600"
          : "border-zinc-200 bg-white text-zinc-600 hover:border-red-200 hover:text-red-500"
      }`}
    >
      <span className="text-lg">{favorited ? "❤️" : "🤍"}</span>
      {favorited ? "즐겨찾기 완료" : "즐겨찾기"}
    </button>
  );
}
