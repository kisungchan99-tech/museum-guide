"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { CATEGORY_LABELS, type Museum, type Program } from "@/types/database";
import ReviewSection from "@/components/ReviewSection";
import VisitButton from "@/components/VisitButton";
import FavoriteButton from "@/components/FavoriteButton";
import KakaoMap from "@/components/KakaoMap";

export default function MuseumDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const [museum, setMuseum] = useState<Museum | null>(null);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      const [museumRes, programRes] = await Promise.all([
        supabase.from("museums").select("*").eq("id", id).single(),
        supabase.from("programs").select("*").eq("museum_id", id),
      ]);

      if (museumRes.error) {
        console.error("Museum fetch error:", museumRes.error);
        setLoading(false);
        return;
      }

      setMuseum(museumRes.data);
      setPrograms(programRes.data ?? []);
      setLoading(false);
    }

    fetchData();
  }, [id]);

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-8">
        <div className="h-64 animate-pulse rounded-xl bg-zinc-200" />
        <div className="mt-6 h-8 w-1/2 animate-pulse rounded bg-zinc-200" />
        <div className="mt-4 h-4 w-full animate-pulse rounded bg-zinc-200" />
      </div>
    );
  }

  if (!museum) {
    return (
      <div className="mx-auto flex max-w-4xl flex-col items-center px-4 py-16">
        <p className="text-lg font-medium text-zinc-500">박물관을 찾을 수 없습니다</p>
        <Link href="/" className="mt-4 text-blue-600 hover:underline">
          홈으로 돌아가기
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      {/* Back */}
      <Link href="/" className="mb-4 inline-flex items-center gap-1 text-sm text-zinc-500 hover:text-blue-600">
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        목록으로
      </Link>

      {/* Hero image */}
      <div className="relative h-64 w-full overflow-hidden rounded-xl bg-zinc-100 sm:h-80">
        <img src={museum.image_url} alt={museum.name} className="h-full w-full object-cover" />
        <span className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 text-sm font-semibold text-zinc-800">
          {CATEGORY_LABELS[museum.category]}
        </span>
      </div>

      {/* Info */}
      <div className="mt-6">
        <h1 className="text-2xl font-bold text-zinc-900 sm:text-3xl">{museum.name}</h1>
        <p className="mt-2 text-zinc-600">{museum.description}</p>
      </div>

      {/* Action buttons */}
      <div className="mt-4 flex gap-3">
        <VisitButton museumId={museum.id} />
        <FavoriteButton museumId={museum.id} />
      </div>

      {/* Map */}
      {process.env.NEXT_PUBLIC_KAKAO_APP_KEY && (
        <div className="mt-6 h-64 w-full">
          <KakaoMap
            museums={[museum]}
            center={{ lat: museum.lat, lng: museum.lng }}
            level={3}
            selectedMuseumId={museum.id}
          />
        </div>
      )}

      {/* Details grid */}
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <InfoItem icon="📍" label="주소" value={museum.address} />
        <InfoItem icon="🕐" label="운영시간" value={museum.hours} />
        <InfoItem icon="💰" label="입장료" value={museum.price} />
        <InfoItem icon="📞" label="전화" value={museum.phone} />
        <InfoItem icon="🌐" label="웹사이트" value={museum.website} isLink />
        <InfoItem icon="👶" label="추천 연령" value={`${museum.target_age_min}~${museum.target_age_max}세`} />
      </div>

      {/* Programs */}
      {programs.length > 0 && (
        <section className="mt-8">
          <h2 className="text-xl font-bold text-zinc-900">교육 프로그램</h2>
          <div className="mt-4 flex flex-col gap-3">
            {programs.map((program) => (
              <div key={program.id} className="rounded-lg border border-zinc-200 bg-white p-4">
                <h3 className="font-semibold text-zinc-900">{program.name}</h3>
                <p className="mt-1 text-sm text-zinc-600">{program.description}</p>
                <div className="mt-2 flex flex-wrap gap-3 text-xs text-zinc-500">
                  <span>🎯 {program.target_age}</span>
                  <span>📅 {program.schedule}</span>
                  <span>💰 {program.price}</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Reviews */}
      <section className="mt-8">
        <h2 className="text-xl font-bold text-zinc-900">리뷰</h2>
        <ReviewSection museumId={museum.id} />
      </section>
    </div>
  );
}

function InfoItem({
  icon,
  label,
  value,
  isLink,
}: {
  icon: string;
  label: string;
  value: string;
  isLink?: boolean;
}) {
  return (
    <div className="flex items-start gap-3 rounded-lg border border-zinc-200 bg-white p-3">
      <span className="text-lg">{icon}</span>
      <div>
        <p className="text-xs font-medium text-zinc-400">{label}</p>
        {isLink ? (
          <a href={value} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline break-all">
            {value}
          </a>
        ) : (
          <p className="text-sm text-zinc-700">{value}</p>
        )}
      </div>
    </div>
  );
}
