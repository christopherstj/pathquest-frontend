import { Toggle } from "@/components/ui/toggle";
import { SquareDashed, SquareCheckBig } from "lucide-react";
import React from "react";

type Props = {
    value: boolean;
    onChange: (value: boolean) => void;
};

const BoundsToggle = ({ value, onChange }: Props) => {
    return (
        // <div className="bg-primary-dim z-10 rounded-full shadow-lg">
        <Toggle
            pressed={value}
            onPressedChange={onChange}
            className="bg-primary-dim z-10 p-2 rounded-full shadow-lg data-[state=on]:bg-primary-foreground data-[state=on]:text-primary flex-0 mouse-pointer"
        >
            {value ? <SquareCheckBig /> : <SquareDashed />}
            Limit To Map Bounds
        </Toggle>
        // </div>
    );
};

export default BoundsToggle;
