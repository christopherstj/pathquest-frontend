"use client";
import { Toggle } from "@/components/ui/toggle";
import { Satellite } from "lucide-react";
import React from "react";

type Props = {
    disabled?: boolean;
    value?: boolean;
    onClick?: (value: boolean) => void;
};

const SatelliteButton = ({ value, onClick, disabled }: Props) => {
    return (
        <Toggle
            disabled={disabled}
            pressed={value}
            onPressedChange={onClick}
            className="bg-card border border-border hover:bg-muted z-10 p-2 rounded-lg shadow-lg data-[state=on]:bg-primary data-[state=on]:text-primary-foreground data-[state=on]:border-primary"
        >
            <Satellite className="w-5 h-5" />
        </Toggle>
    );
};

export default SatelliteButton;
