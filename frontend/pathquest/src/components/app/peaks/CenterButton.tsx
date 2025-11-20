"use client";
import { Button } from "@/components/ui/button";
import { useMapStore } from "@/providers/MapProvider";
import { MapPin } from "lucide-react";
import React from "react";

type Props = {
    lat: number;
    lng: number;
    color: "primary" | "secondary";
};

const CenterButton = ({ lat, lng, color }: Props) => {
    const map = useMapStore((state) => state.map);

    const onClick = (e: React.MouseEvent<SVGSVGElement>) => {
        e.preventDefault();
        e.stopPropagation();
        if (map) {
            map.flyTo({
                center: [lng, lat],
                zoom: 12,
            });
        }
    };

    return (
        <MapPin
            className={`
                ${
                    color === "primary"
                        ? "text-primary-foreground-dim hover:bg-primary-dim hover:text-primary-foreground"
                        : "text-secondary-foreground-dim hover:bg-secondary-dim hover:text-secondary-foreground"
                } rounded-full w-4 h-4 p-0`}
            onClick={onClick}
        />
    );
};

export default CenterButton;
