"use client";
import { Toggle } from "@/components/ui/toggle";
import { Box } from "lucide-react";
import React from "react";

type Props = {
    value?: boolean;
    onClick?: (value: boolean) => void;
};

const ThreeDButton = ({ value, onClick }: Props) => {
    return (
        <Toggle
            pressed={value}
            onPressedChange={onClick}
            className="bg-primary-dim z-10 p-2 rounded-lg shadow-lg data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
        >
            <Box className="w-5 h-5" />
        </Toggle>
    );
};

export default ThreeDButton;
