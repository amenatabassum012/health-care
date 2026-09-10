import { useEffect, useRef } from "react";
import * as maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

import type { HealthcareFacility } from "@/lib/location";

interface LocationMapProps {
  latitude: number | null;
  longitude: number | null;
  facilities?: HealthcareFacility[];
  height?: string;
}

export default function LocationMap({
  latitude,
  longitude,
  facilities = [],
  height = "350px",
}: LocationMapProps) {
  const mapContainer = useRef<HTMLDivElement | null>(null);

  const mapRef = useRef<maplibregl.Map | null>(null);

  const userMarkerRef =
    useRef<maplibregl.Marker | null>(null);

  const facilityMarkersRef =
    useRef<maplibregl.Marker[]>([]);

  // Create map
  useEffect(() => {
    if (!mapContainer.current) return;

    if (mapRef.current) return;

    if (latitude === null || longitude === null) {
      return;
    }

    const map = new maplibregl.Map({
      container: mapContainer.current,

      style:
        "https://demotiles.maplibre.org/globe.json",

      center: [longitude, latitude],

      zoom: 13,
    });

    map.addControl(
      new maplibregl.NavigationControl(),
      "top-right"
    );

    // User location marker
    const userMarker = new maplibregl.Marker({
      color: "#14b8a6",
    })
      .setLngLat([
        longitude,
        latitude,
      ])
      .addTo(map);

    mapRef.current = map;

    userMarkerRef.current = userMarker;

    return () => {
      facilityMarkersRef.current.forEach(
        (marker) => marker.remove()
      );

      facilityMarkersRef.current = [];

      userMarker.remove();

      map.remove();

      userMarkerRef.current = null;

      mapRef.current = null;
    };
  }, [latitude, longitude]);

  // Update user's marker when location changes
  useEffect(() => {
    if (
      latitude === null ||
      longitude === null ||
      !mapRef.current
    ) {
      return;
    }

    const position: [number, number] = [
      longitude,
      latitude,
    ];

    if (userMarkerRef.current) {
      userMarkerRef.current.setLngLat(position);
    }

    mapRef.current.flyTo({
      center: position,
      zoom: 13,
      essential: true,
    });
  }, [latitude, longitude]);

  // Add healthcare facility markers
  useEffect(() => {
    if (!mapRef.current) return;

    // Remove old facility markers
    facilityMarkersRef.current.forEach(
      (marker) => marker.remove()
    );

    facilityMarkersRef.current = [];

    // Add new markers
    facilities.forEach((facility) => {
      const popup = new maplibregl.Popup({
        offset: 25,
      }).setHTML(`
        <div style="padding: 4px;">
          <strong>${facility.name}</strong>
          <br />
          <span>${facility.facility_type}</span>
          ${
            facility.village
              ? `<br /><span>${facility.village}</span>`
              : ""
          }
        </div>
      `);

      const marker = new maplibregl.Marker({
        color: "#ef4444",
      })
        .setLngLat([
          facility.longitude,
          facility.latitude,
        ])
        .setPopup(popup)
        .addTo(mapRef.current!);

      facilityMarkersRef.current.push(marker);
    });
  }, [facilities]);

  return (
    <div
      ref={mapContainer}
      style={{
        width: "100%",
        height,
        minHeight: "300px",
        borderRadius: "12px",
        overflow: "hidden",
      }}
    />
  );
}