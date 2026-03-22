import Link from "next/link";
import { CATEGORY_LABELS, type Museum, type MuseumCategory } from "@/types/database";

type Props = {
  museum: Museum;
};

const accentColors: Record<MuseumCategory, string> = {
  history: "bg-amber-500",
  science: "bg-blue-500",
  art: "bg-purple-500",
  nature: "bg-green-500",
  children: "bg-pink-500",
  experience: "bg-orange-500",
};

const badgeColors: Record<MuseumCategory, string> = {
  history: "bg-amber-50 text-amber-700 ring-amber-200",
  science: "bg-blue-50 text-blue-700 ring-blue-200",
  art: "bg-purple-50 text-purple-700 ring-purple-200",
  nature: "bg-green-50 text-green-700 ring-green-200",
  children: "bg-pink-50 text-pink-700 ring-pink-200",
  experience: "bg-orange-50 text-orange-700 ring-orange-200",
};

export default function MuseumCard({ museum }: Props) {
  const accent = accentColors[museum.category] ?? "bg-zinc-500";
  const badge = badgeColors[museum.category] ?? "bg-zinc-50 text-zinc-700 ring-zinc-200";
  const categoryLabel = CATEGORY_LABELS[museum.category] ?? museum.category;

  return (
    <Link href={`/museums/${museum.id}`} className="group block">
      <div className="relative overflow-hidden rounded-xl border border-zinc-200 bg-white transition-all hover:shadow-lg hover:-translate-y-0.5">
        {/* Accent bar */}
        <div className={`h-1 w-full ${accent}`} />

        <div className="p-5">
          {/* Category + Region */}
          <div className="flex items-center gap-2">
            <span className={`inline-flex rounded-md px-2 py-0.5 text-xs font-semibold ring-1 ring-inset ${badge}`}>
              {categoryLabel}
            </span>
            <span className="text-xs text-zinc-400">{museum.region}</span>
          </div>

          {/* Name */}
          <h3 className="mt-2.5 text-lg font-bold leading-tight text-zinc-900 group-hover:text-blue-600 transition-colors">
            {museum.name}
          </h3>

          {/* Address */}
          <p className="mt-1 text-xs text-zinc-400">
            {museum.address.split(" ").slice(0, 3).join(" ")}
          </p>

          {/* Description */}
          <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-zinc-500">
            {museum.description}
          </p>

          {/* Footer */}
          <div className="mt-4 flex items-center justify-between border-t border-zinc-100 pt-3">
            <span className="text-sm font-bold text-blue-600">{museum.price}</span>
            <span className="text-xs font-medium text-zinc-400">
              추천 {museum.target_age_min}~{museum.target_age_max}세
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
