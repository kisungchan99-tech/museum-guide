"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import type { Museum } from "@/types/database";
import MuseumCard from "./MuseumCard";
import MuseumFilter from "./MuseumFilter";
import KakaoMap from "./KakaoMap";

export default function MuseumList() {
  const [museums, setMuseums] = useState<Museum[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRegion, setSelectedRegion] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    async function fetchMuseums() {
      const { data, error } = await supabase
        .from("museums")
        .select("*")
        .order("name");

      if (error) {
        console.error("Failed to fetch museums:", error);
        return;
      }

      setMuseums(data ?? []);
      setLoading(false);
    }

    fetchMuseums();
  }, []);

  const filtered = museums.filter((m) => {
    if (selectedRegion && m.region !== selectedRegion) return false;
    if (selectedCategory && m.category !== selectedCategory) return false;
    if (searchQuery && !m.name.includes(searchQuery)) return false;
    return true;
  });

  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-72 animate-pulse rounded-xl bg-zinc-200" />
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <MuseumFilter
        selectedRegion={selectedRegion}
        selectedCategory={selectedCategory}
        searchQuery={searchQuery}
        onRegionChange={setSelectedRegion}
        onCategoryChange={setSelectedCategory}
        onSearchChange={setSearchQuery}
      />

      {/* Map */}
      <div className="h-80 w-full">
        <KakaoMap museums={filtered} />
      </div>

      <p className="text-sm text-zinc-500">
        총 <span className="font-semibold text-zinc-900">{filtered.length}</span>개 박물관
      </p>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-zinc-200 bg-white py-16">
          <p className="text-lg font-medium text-zinc-500">검색 결과가 없습니다</p>
          <p className="mt-1 text-sm text-zinc-400">다른 조건으로 검색해보세요</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((museum) => (
            <MuseumCard key={museum.id} museum={museum} />
          ))}
        </div>
      )}
    </div>
  );
}
