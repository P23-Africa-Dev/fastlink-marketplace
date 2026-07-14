"use client";

import * as React from "react";
import Map, { NavigationControl, Marker, ViewStateChangeEvent } from "react-map-gl/mapbox";
import { useMalls } from "@/lib/hooks/use-malls";
import { MapPin } from "lucide-react";
import "mapbox-gl/dist/mapbox-gl.css";

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

export function MallMap() {
  const { data: malls, isLoading } = useMalls();
  const [viewState, setViewState] = React.useState({
    latitude: 6.5244, // Default center (e.g. Lagos, Nigeria or placeholder coords)
    longitude: 3.3792,
    zoom: 11,
  });

  if (!MAPBOX_TOKEN) {
    return (
      <div className="w-full h-[450px] bg-surface-card border border-dashed border-secondary-border rounded-xl flex flex-col items-center justify-center p-6 text-center">
        <MapPin className="h-10 w-10 text-accent-orange animate-bounce mb-3" />
        <h3 className="text-lg font-semibold text-primary-dark">Mapbox Token Missing</h3>
        <p className="text-sm text-gray-500 max-w-sm mt-1">
          Please configure `NEXT_PUBLIC_MAPBOX_TOKEN` in your environment files to display the interactive map.
        </p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="w-full h-[450px] bg-surface-card border border-surface-light rounded-xl flex items-center justify-center">
        <span className="text-sm text-primary font-medium">Loading map...</span>
      </div>
    );
  }

  return (
    <div className="w-full h-[450px] overflow-hidden rounded-xl border border-surface-light shadow-sm">
      <Map
        {...viewState}
        onMove={(evt: ViewStateChangeEvent) => setViewState(evt.viewState)}
        mapStyle="mapbox://styles/mapbox/streets-v12"
        mapboxAccessToken={MAPBOX_TOKEN}
      >
        <NavigationControl position="top-right" />
        {malls?.map((mall) => (
          <Marker
            key={mall.id}
            latitude={mall.latitude}
            longitude={mall.longitude}
            anchor="bottom"
          >
            <div className="group relative cursor-pointer">
              <MapPin className="h-8 w-8 text-primary hover:text-accent-orange transition-colors fill-surface-light" />
              <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 hidden group-hover:block bg-dark text-white text-xs px-2.5 py-1 rounded shadow-md whitespace-nowrap z-50">
                {mall.name}
              </div>
            </div>
          </Marker>
        ))}
      </Map>
    </div>
  );
}
export default MallMap;
