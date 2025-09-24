"use client";
import { Button } from "@/components/ui/button";
import { useMapStore } from "@/providers/MapProvider";
import { MapPin } from "lucide-react";
import React from "react";

type Props = {
    lat: number;
    lng: number;
};

const CenterButton = ({ lat, lng }: Props) => {
    const map = useMapStore((state) => state.map);

    const onClick = () => {
        if (map) {
            map.flyTo({
                center: [lng, lat],
                zoom: 12,
            });
        }
    };

    return (
        <Button
            variant="ghost"
            size="icon"
            className="text-primary-foreground-dim rounded-full hover:bg-primary-dim hover:text-primary-foreground-dim"
            onClick={onClick}
        >
            <MapPin />
        </Button>
    );
};

export default CenterButton;
