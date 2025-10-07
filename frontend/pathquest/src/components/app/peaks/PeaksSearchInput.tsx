"use client";
import { Input } from "@/components/ui/input";
import React from "react";

type Props = {
    value: string;
    onChange: (value: string) => void;
};

const PeaksSearchInput = ({ value, onChange }: Props) => {
    return (
        <div className="bg-primary-dim z-10 p-2 rounded-lg shadow-lg w-full flex-0">
            <Input
                className="w-full"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder="Search Peaks"
            />
        </div>
    );
};

export default PeaksSearchInput;
