"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { Flame, Layers, Mountain, Snowflake } from "lucide-react";
import { useMapStore } from "@/providers/MapProvider";
import { cn } from "@/lib/utils";
import { Switch } from "@/components/ui/switch";
import getMapAvalanches from "@/actions/map/getMapAvalanches";
import getMapFires from "@/actions/map/getMapFires";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

type LegendStop = { color: string; label: string };

type MapLayerConfig = {
    id: string;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    legend?: LegendStop[];
} & (
    | {
          sourceType: "raster";
          source: { type: "raster"; tiles: string[]; tileSize: number };
          layers: {
              id: string;
              type: "raster";
              paint: Record<string, unknown>;
          }[];
      }
    | {
          sourceType: "geojson";
          fetchData: (bbox: string) => Promise<GeoJSON.FeatureCollection | null>;
          layers: {
              id: string;
              type: "fill" | "line";
              paint: Record<string, unknown>;
              filter?: any[];
          }[];
      }
);

// ─────────────────────────────────────────────────────────────────────────────
// Layer Configs
// ─────────────────────────────────────────────────────────────────────────────

const MAP_LAYERS: MapLayerConfig[] = [
    {
        id: "snow-depth",
        label: "Snow Depth",
        icon: Snowflake,
        sourceType: "raster",
        source: {
            type: "raster",
            tiles: [
                "https://mapservices.weather.noaa.gov/raster/rest/services/snow/NOHRSC_Snow_Analysis/MapServer/export?bbox={bbox-epsg-3857}&bboxSR=3857&imageSR=3857&size=256,256&layers=show:3&format=png32&transparent=true&f=image",
            ],
            tileSize: 256,
        },
        layers: [
            {
                id: "snow-depth-layer",
                type: "raster",
                paint: { "raster-opacity": 0.6 },
            },
        ],
        legend: [
            { color: "#d4e7f7", label: "Trace" },
            { color: "#99c5e8", label: '2"' },
            { color: "#4a90d9", label: '6"' },
            { color: "#2b5fad", label: '12"' },
            { color: "#7b2d8e", label: '24"' },
            { color: "#c02942", label: '48"' },
            { color: "#e87d2f", label: '72"+' },
        ],
    },
    {
        id: "avalanche-zones",
        label: "Avalanche Zones",
        icon: Mountain,
        sourceType: "geojson",
        fetchData: getMapAvalanches,
        layers: [
            {
                id: "avalanche-zones-fill",
                type: "fill",
                paint: {
                    "fill-color": [
                        "match",
                        ["get", "maxDanger"],
                        1, "#22c55e",
                        2, "#eab308",
                        3, "#f97316",
                        4, "#ef4444",
                        5, "#991b1b",
                        "#94a3b8", // default (0 / no rating)
                    ],
                    "fill-opacity": 0.3,
                },
            },
            {
                id: "avalanche-zones-line",
                type: "line",
                paint: {
                    "line-color": [
                        "match",
                        ["get", "maxDanger"],
                        1, "#22c55e",
                        2, "#eab308",
                        3, "#f97316",
                        4, "#ef4444",
                        5, "#991b1b",
                        "#94a3b8",
                    ],
                    "line-width": 1.5,
                    "line-opacity": 0.7,
                },
            },
        ],
        legend: [
            { color: "#94a3b8", label: "No Rating" },
            { color: "#22c55e", label: "Low" },
            { color: "#eab308", label: "Moderate" },
            { color: "#f97316", label: "Considerable" },
            { color: "#ef4444", label: "High" },
            { color: "#991b1b", label: "Extreme" },
        ],
    },
    {
        id: "active-fires",
        label: "Active Fires",
        icon: Flame,
        sourceType: "geojson",
        fetchData: getMapFires,
        layers: [
            {
                id: "active-fires-fill",
                type: "fill",
                paint: {
                    "fill-color": "#ef4444",
                    "fill-opacity": [
                        "interpolate",
                        ["linear"],
                        ["get", "percent_contained"],
                        0, 0.5,
                        100, 0.15,
                    ],
                },
            },
            {
                id: "active-fires-line",
                type: "line",
                paint: {
                    "line-color": "#dc2626",
                    "line-width": 2,
                    "line-opacity": 0.8,
                },
            },
        ],
        legend: [
            { color: "#ef4444", label: "0%" },
            { color: "#f97316", label: "25%" },
            { color: "#eab308", label: "50%" },
            { color: "#84cc16", label: "75%" },
            { color: "#22c55e", label: "100%" },
        ],
    },
];

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

/** Compute max danger from the JSONB danger array (first day, across elevation bands). */
function computeMaxDanger(danger: any): number {
    if (!Array.isArray(danger) || danger.length === 0) return 0;
    const today = danger[0];
    if (!today) return 0;
    return Math.max(
        Number(today.upper) || 0,
        Number(today.middle) || 0,
        Number(today.lower) || 0
    );
}

/** Get bbox string from map bounds: "minLng,minLat,maxLng,maxLat" */
function getBboxFromMap(map: mapboxgl.Map): string {
    const bounds = map.getBounds()!;
    return `${bounds.getWest()},${bounds.getSouth()},${bounds.getEast()},${bounds.getNorth()}`;
}

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

const MapLayersControl = () => {
    const [isOpen, setIsOpen] = useState(false);
    const panelRef = useRef<HTMLDivElement>(null);
    const buttonRef = useRef<HTMLButtonElement>(null);
    const map = useMapStore((state) => state.map);
    const activeLayers = useMapStore((state) => state.activeLayers);
    const toggleLayer = useMapStore((state) => state.toggleLayer);

    // Cache of fetched GeoJSON data per layer id (for style change re-adds)
    const geojsonCache = useRef<Record<string, GeoJSON.FeatureCollection>>({});
    // Track debounce timers per layer
    const debounceTimers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

    // Close panel when clicking outside
    useEffect(() => {
        if (!isOpen) return;

        const handleClickOutside = (e: MouseEvent) => {
            if (
                panelRef.current &&
                !panelRef.current.contains(e.target as Node) &&
                buttonRef.current &&
                !buttonRef.current.contains(e.target as Node)
            ) {
                setIsOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () =>
            document.removeEventListener("mousedown", handleClickOutside);
    }, [isOpen]);

    // ── Add/remove raster layers ─────────────────────────────────────────
    const applyRasterLayer = useCallback(
        (layerConfig: Extract<MapLayerConfig, { sourceType: "raster" }>, active: boolean) => {
            if (!map) return;
            const sourceId = layerConfig.id;

            if (active) {
                if (!map.getSource(sourceId)) {
                    map.addSource(sourceId, layerConfig.source);
                }
                for (const l of layerConfig.layers) {
                    if (!map.getLayer(l.id)) {
                        map.addLayer(
                            {
                                id: l.id,
                                type: l.type as any,
                                source: sourceId,
                                paint: l.paint as any,
                            },
                            map.getLayer("peaks-clusters")
                                ? "peaks-clusters"
                                : undefined
                        );
                    }
                }
            } else {
                for (const l of layerConfig.layers) {
                    if (map.getLayer(l.id)) map.removeLayer(l.id);
                }
                if (map.getSource(sourceId)) map.removeSource(sourceId);
            }
        },
        [map]
    );

    // ── Add/remove GeoJSON layers ────────────────────────────────────────
    const applyGeojsonLayers = useCallback(
        (
            layerConfig: Extract<MapLayerConfig, { sourceType: "geojson" }>,
            data: GeoJSON.FeatureCollection
        ) => {
            if (!map) return;
            const sourceId = layerConfig.id;

            // Pre-process: add maxDanger for avalanche zones
            if (layerConfig.id === "avalanche-zones") {
                for (const f of data.features) {
                    f.properties = f.properties || {};
                    f.properties.maxDanger = computeMaxDanger(
                        f.properties.danger
                    );
                }
            }

            const existing = map.getSource(sourceId) as mapboxgl.GeoJSONSource | undefined;
            if (existing) {
                existing.setData(data);
            } else {
                map.addSource(sourceId, { type: "geojson", data });
            }

            for (const l of layerConfig.layers) {
                if (!map.getLayer(l.id)) {
                    map.addLayer(
                        {
                            id: l.id,
                            type: l.type as any,
                            source: sourceId,
                            paint: l.paint as any,
                            ...(l.filter ? { filter: l.filter } : {}),
                        },
                        map.getLayer("peaks-clusters")
                            ? "peaks-clusters"
                            : undefined
                    );
                }
            }
        },
        [map]
    );

    const removeGeojsonLayers = useCallback(
        (layerConfig: Extract<MapLayerConfig, { sourceType: "geojson" }>) => {
            if (!map) return;
            for (const l of layerConfig.layers) {
                if (map.getLayer(l.id)) map.removeLayer(l.id);
            }
            if (map.getSource(layerConfig.id)) {
                map.removeSource(layerConfig.id);
            }
        },
        [map]
    );

    // ── Fetch and apply GeoJSON data for a layer ─────────────────────────
    const fetchAndApply = useCallback(
        async (
            layerConfig: Extract<MapLayerConfig, { sourceType: "geojson" }>
        ) => {
            if (!map) return;
            const bbox = getBboxFromMap(map);
            const data = await layerConfig.fetchData(bbox);
            if (!data) return;

            geojsonCache.current[layerConfig.id] = data;

            // Only apply if still active
            if (!map.isStyleLoaded()) return;
            applyGeojsonLayers(layerConfig, data);
        },
        [map, applyGeojsonLayers]
    );

    // ── Sync all layers with the map ─────────────────────────────────────
    useEffect(() => {
        if (!map) return;

        const apply = () => {
            for (const layerConfig of MAP_LAYERS) {
                const isActive = activeLayers.includes(layerConfig.id);

                if (layerConfig.sourceType === "raster") {
                    applyRasterLayer(layerConfig, isActive);
                } else if (layerConfig.sourceType === "geojson") {
                    if (isActive) {
                        fetchAndApply(layerConfig);
                    } else {
                        removeGeojsonLayers(layerConfig);
                        delete geojsonCache.current[layerConfig.id];
                    }
                }
            }
        };

        if (map.isStyleLoaded()) {
            apply();
        } else {
            map.once("style.load", apply);
        }
    }, [map, activeLayers, applyRasterLayer, fetchAndApply, removeGeojsonLayers]);

    // ── moveend listener for GeoJSON layers ──────────────────────────────
    useEffect(() => {
        if (!map) return;

        const handleMoveEnd = () => {
            for (const layerConfig of MAP_LAYERS) {
                if (
                    layerConfig.sourceType !== "geojson" ||
                    !activeLayers.includes(layerConfig.id)
                )
                    continue;

                // Debounce re-fetches
                clearTimeout(debounceTimers.current[layerConfig.id]);
                debounceTimers.current[layerConfig.id] = setTimeout(() => {
                    fetchAndApply(layerConfig);
                }, 500);
            }
        };

        map.on("moveend", handleMoveEnd);
        return () => {
            map.off("moveend", handleMoveEnd);
            // Clear any pending debounce timers
            for (const timerId of Object.values(debounceTimers.current)) {
                clearTimeout(timerId);
            }
        };
    }, [map, activeLayers, fetchAndApply]);

    // ── Re-add layers after style change ─────────────────────────────────
    useEffect(() => {
        if (!map) return;

        const handleStyleLoad = () => {
            for (const layerConfig of MAP_LAYERS) {
                if (!activeLayers.includes(layerConfig.id)) continue;

                if (layerConfig.sourceType === "raster") {
                    applyRasterLayer(layerConfig, true);
                } else if (layerConfig.sourceType === "geojson") {
                    const cached = geojsonCache.current[layerConfig.id];
                    if (cached) {
                        applyGeojsonLayers(layerConfig, cached);
                    } else {
                        fetchAndApply(layerConfig);
                    }
                }
            }
        };

        map.on("style.load", handleStyleLoad);
        return () => {
            map.off("style.load", handleStyleLoad);
        };
    }, [map, activeLayers, applyRasterLayer, applyGeojsonLayers, fetchAndApply]);

    const hasActiveLayers = activeLayers.length > 0;

    return (
        <div className="relative">
            {/* Layers Toggle Button */}
            <button
                ref={buttonRef}
                onClick={() => setIsOpen(!isOpen)}
                className={cn(
                    "w-[30px] h-[30px] rounded-lg flex items-center justify-center",
                    "bg-card/80 backdrop-blur-md border border-border shadow-lg",
                    "hover:border-primary/30 transition-colors",
                    "focus:outline-none focus:ring-2 focus:ring-ring",
                    hasActiveLayers && "border-primary/50"
                )}
                title="Map layers"
                aria-label="Toggle map layers panel"
            >
                <Layers
                    className={cn(
                        "w-4 h-4",
                        hasActiveLayers
                            ? "text-primary"
                            : "text-muted-foreground"
                    )}
                />
            </button>

            {/* Layers Panel — opens downward */}
            {isOpen && (
                <div
                    ref={panelRef}
                    className="absolute top-full mt-2 left-0 w-56 bg-popover/95 backdrop-blur-md rounded-lg shadow-lg border border-border overflow-hidden z-50"
                >
                    <div className="px-3 py-2 border-b border-border">
                        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                            Map Layers
                        </span>
                    </div>
                    <div className="p-2">
                        {MAP_LAYERS.map((layerConfig) => {
                            const isActive = activeLayers.includes(
                                layerConfig.id
                            );
                            const Icon = layerConfig.icon;
                            return (
                                <div key={layerConfig.id}>
                                    <div className="flex items-center justify-between px-2 py-1.5 rounded-md hover:bg-muted/50 transition-colors">
                                        <div className="flex items-center gap-2">
                                            <Icon
                                                className={cn(
                                                    "w-4 h-4",
                                                    isActive
                                                        ? "text-primary"
                                                        : "text-muted-foreground"
                                                )}
                                            />
                                            <span className="text-sm text-foreground">
                                                {layerConfig.label}
                                            </span>
                                        </div>
                                        <Switch
                                            checked={isActive}
                                            onCheckedChange={() =>
                                                toggleLayer(layerConfig.id)
                                            }
                                        />
                                    </div>
                                    {/* Legend */}
                                    {layerConfig.legend &&
                                        isActive && (
                                            <div className="px-2 pb-2 pt-1">
                                                <div className="flex items-center gap-0.5">
                                                    {layerConfig.legend.map(
                                                        (stop) => (
                                                            <div
                                                                key={stop.label}
                                                                className="flex-1 flex flex-col items-center"
                                                            >
                                                                <div
                                                                    className="w-full h-2 rounded-sm"
                                                                    style={{
                                                                        backgroundColor:
                                                                            stop.color,
                                                                    }}
                                                                />
                                                                <span className="text-[9px] text-muted-foreground mt-0.5 leading-none">
                                                                    {
                                                                        stop.label
                                                                    }
                                                                </span>
                                                            </div>
                                                        )
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
};

export default MapLayersControl;
