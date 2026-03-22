import Link from "next/link";
import { CATEGORY_LABELS, type Museum, type MuseumCategory } from "@/types/database";

type Props = {
  museum: Museum;
};

const categoryColors: Record<MuseumCategory, string> = {
  history: "bg-amber-100 text-amber-800",
  science: "bg-blue-100 text-blue-800",
  art: "bg-purple-100 text-purple-800",
  nature: "bg-green-100 text-green-800",
  children: "bg-pink-100 text-pink-800",
  experience: "bg-orange-100 text-orange-800",
};

export default function MuseumCard({ museum }: Props) {
  const categoryColor = categoryColors[museum.category] ?? "bg-zinc-100 text-zinc-800";
  const categoryLabel = CATEGORY_LABELS[museum.category] ?? museum.category;

  return (
    <Link href={`/museums/${museum.id}`} className="group block">
      <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm transition-shadow hover:shadow-md">
        {/* Image */}
        <div className="relative h-48 w-full overflow-hidden bg-zinc-100">
          <img
            src={museum.image_url}
            alt={museum.name}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />
          <span
            className={`absolute left-3 top-3 rounded-full px-3 py-1 text-xs font-semibold ${categoryColor}`}
          >
            {categoryLabel}
          </span>
        </div>

        {/* Content */}
        <div className="p-4">
          <h3 className="text-base font-bold text-zinc-900 group-hover:text-blue-600 transition-colors">
            {museum.name}
          </h3>
          <p className="mt-1 text-sm text-zinc-500">{museum.region} · {museum.address.split(" ").slice(0, 2).join(" ")}</p>
          <p className="mt-2 line-clamp-2 text-sm text-zinc-600">{museum.description}</p>
          <div className="mt-3 flex items-center justify-between">
            <span className="text-sm font-semibold text-blue-600">{museum.price}</span>
            <span className="text-xs text-zinc-400">
              {museum.target_age_min}~{museum.target_age_max}세
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
