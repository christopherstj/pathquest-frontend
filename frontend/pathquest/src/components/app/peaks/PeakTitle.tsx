import { Button } from "@/components/ui/button";
import metersToFt from "@/helpers/metersToFt";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import React from "react";

type Props = {
    name: string;
    elevation: number;
    location: string;
};

const PeakTitle = (props: Props) => {
    return (
        <div className="bg-primary py-2 px-4 rounded-md flex gap-2 items-center shadow-md">
            <Link href="/m/peaks">
                <Button
                    variant="ghost"
                    size="icon"
                    asChild
                    className="text-primary-foreground-dim bg-primary rounded-full hover:bg-primary-dim hover:text-primary-foreground-dim"
                >
                    <ArrowLeft size="small" />
                </Button>
            </Link>
            <h1 className="text-2xl font-bold basis-auto text-base-foreground">
                {props.name || "Unnamed Peak"}
            </h1>
            <p className="text-sm text-primary-foreground-dim">
                {props.location}
            </p>
            <div className="rounded-sm bg-primary-foreground/20 px-2 py-1">
                <p className="text-sm text-primary-foreground font-semibold">
                    {metersToFt(props.elevation).toFixed(0)} ft
                </p>
            </div>
        </div>
    );
};

export default PeakTitle;
