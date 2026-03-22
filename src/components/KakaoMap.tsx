"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import type { Museum } from "@/types/database";

declare global {
  interface Window {
    kakao: any;
  }
}

type Props = {
  museums: Museum[];
  center?: { lat: number; lng: number };
  level?: number;
  onMarkerClick?: (museumId: string) => void;
  selectedMuseumId?: string;
  visitedMuseumIds?: Set<string>;
};

export default function KakaoMap({
  museums,
  center,
  level = 12,
  onMarkerClick,
  selectedMuseumId,
  visitedMuseumIds,
}: Props) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);

  // Wait for kakao SDK to be available
  useEffect(() => {
    function check() {
      if (window.kakao?.maps) {
        window.kakao.maps.load(() => setReady(true));
        return true;
      }
      return false;
    }

    if (check()) return;

    // Poll until SDK is loaded (from layout Script tag)
    const interval = setInterval(() => {
      if (check()) clearInterval(interval);
    }, 200);

    return () => clearInterval(interval);
  }, []);

  // Init map
  useEffect(() => {
    if (!ready || !mapRef.current) return;

    const defaultCenter = center ?? { lat: 36.5, lng: 127.5 };
    const mapCenter = new window.kakao.maps.LatLng(defaultCenter.lat, defaultCenter.lng);

    const map = new window.kakao.maps.Map(mapRef.current, {
      center: mapCenter,
      level,
    });

    const infowindow = new window.kakao.maps.InfoWindow({ zIndex: 1 });

    museums.forEach((museum) => {
      const position = new window.kakao.maps.LatLng(museum.lat, museum.lng);

      let markerImage;
      if (visitedMuseumIds?.has(museum.id)) {
        const imageSrc = "https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/markerStar.png";
        const imageSize = new window.kakao.maps.Size(24, 35);
        markerImage = new window.kakao.maps.MarkerImage(imageSrc, imageSize);
      }

      const marker = new window.kakao.maps.Marker({
        map,
        position,
        title: museum.name,
        image: markerImage,
      });

      window.kakao.maps.event.addListener(marker, "mouseover", () => {
        infowindow.setContent(
          `<div style="padding:5px;font-size:12px;white-space:nowrap;">${museum.name}</div>`
        );
        infowindow.open(map, marker);
      });

      window.kakao.maps.event.addListener(marker, "mouseout", () => {
        infowindow.close();
      });

      window.kakao.maps.event.addListener(marker, "click", () => {
        if (onMarkerClick) {
          onMarkerClick(museum.id);
        } else {
          window.location.href = `/museums/${museum.id}`;
        }
      });

      if (selectedMuseumId === museum.id) {
        map.setCenter(position);
        map.setLevel(3);
        infowindow.setContent(
          `<div style="padding:5px;font-size:12px;white-space:nowrap;font-weight:bold;">${museum.name}</div>`
        );
        infowindow.open(map, marker);
      }
    });
  }, [ready, museums, center, selectedMuseumId, visitedMuseumIds, level, onMarkerClick]);

  return (
    <div
      ref={mapRef}
      className="h-full w-full rounded-xl border border-zinc-200 bg-zinc-100"
      style={{ minHeight: "300px" }}
    />
  );
}
