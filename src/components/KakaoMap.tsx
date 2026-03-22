"use client";

import { useEffect, useRef } from "react";
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
  const mapInstanceRef = useRef<any>(null);

  useEffect(() => {
    const appKey = process.env.NEXT_PUBLIC_KAKAO_APP_KEY;
    if (!appKey || !mapRef.current) return;

    // Load Kakao Maps SDK
    if (window.kakao?.maps) {
      initMap();
      return;
    }

    const script = document.createElement("script");
    script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${appKey}&autoload=false`;
    script.async = true;
    script.onload = () => {
      window.kakao.maps.load(() => {
        initMap();
      });
    };
    document.head.appendChild(script);

    return () => {
      if (document.head.contains(script)) {
        document.head.removeChild(script);
      }
    };
  }, [museums, center, selectedMuseumId]);

  function initMap() {
    if (!mapRef.current || !window.kakao?.maps) return;

    const defaultCenter = center ?? { lat: 36.5, lng: 127.5 };
    const mapCenter = new window.kakao.maps.LatLng(defaultCenter.lat, defaultCenter.lng);

    const map = new window.kakao.maps.Map(mapRef.current, {
      center: mapCenter,
      level: level,
    });

    mapInstanceRef.current = map;

    // Add markers
    const infowindow = new window.kakao.maps.InfoWindow({ zIndex: 1 });

    museums.forEach((museum) => {
      const position = new window.kakao.maps.LatLng(museum.lat, museum.lng);

      // Determine marker image based on visit status
      let markerImage;
      if (visitedMuseumIds?.has(museum.id)) {
        const imageSrc = "https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/markerStar.png";
        const imageSize = new window.kakao.maps.Size(24, 35);
        markerImage = new window.kakao.maps.MarkerImage(imageSrc, imageSize);
      }

      const marker = new window.kakao.maps.Marker({
        map: map,
        position: position,
        title: museum.name,
        image: markerImage,
      });

      // Info window on hover
      window.kakao.maps.event.addListener(marker, "mouseover", () => {
        infowindow.setContent(
          `<div style="padding:5px;font-size:12px;white-space:nowrap;">${museum.name}</div>`
        );
        infowindow.open(map, marker);
      });

      window.kakao.maps.event.addListener(marker, "mouseout", () => {
        infowindow.close();
      });

      // Click to navigate
      window.kakao.maps.event.addListener(marker, "click", () => {
        if (onMarkerClick) {
          onMarkerClick(museum.id);
        } else {
          window.location.href = `/museums/${museum.id}`;
        }
      });

      // If this museum is selected, pan to it
      if (selectedMuseumId === museum.id) {
        map.setCenter(position);
        map.setLevel(3);
        infowindow.setContent(
          `<div style="padding:5px;font-size:12px;white-space:nowrap;font-weight:bold;">${museum.name}</div>`
        );
        infowindow.open(map, marker);
      }
    });
  }

  return (
    <div
      ref={mapRef}
      className="h-full w-full rounded-xl border border-zinc-200"
      style={{ minHeight: "300px" }}
    />
  );
}
