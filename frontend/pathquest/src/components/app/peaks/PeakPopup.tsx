"use client";
import { Button } from "@/components/ui/button";
import Peak from "@/typeDefs/Peak";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React from "react";

type Props = {
    peak: Peak;
    onRouteChange?: () => void;
};

const PeakPopup = ({ peak, onRouteChange }: Props) => {
    const handleClick = () => {
        if (onRouteChange) {
            onRouteChange();
        }
    };

    return (
        <div
            onClick={handleClick}
            className="max-w-[250px] bg-primary text-primary-foreground p-2 pb-0 rounded-lg shadow-lg flex flex-col cursor-pointer"
        >
            <div className="flex flex-col gap-1 justify-between mb-2">
                <div className="flex justify-between gap-2 items-center">
                    <h5 className="text-lg font-semibold text-primary-foreground w-full text-center">
                        {peak.Name}
                    </h5>
                </div>
                <div className="flex justify-between items-center gap-2">
                    <p className="text-sm text-primary-foreground-dim">
                        Elevation
                    </p>
                    <p className="text-sm text-primary-foreground">
                        {peak.Altitude} m
                    </p>
                </div>
                {peak.summits !== undefined && peak.summits > 0 && (
                    <div className="flex justify-between items-center gap-2">
                        <p className="text-sm text-primary-foreground-dim">
                            My summits
                        </p>
                        <p className="text-sm text-primary-foreground">
                            {peak.summits}
                        </p>
                    </div>
                )}
                <div className="flex justify-between items-center gap-2">
                    <p className="text-sm text-primary-foreground-dim">
                        All summits
                    </p>
                    <p className="text-sm text-primary-foreground">
                        {peak.publicSummits}
                    </p>
                </div>
                <Button
                    size="sm"
                    className="w-full cursor-pointer rounded-full bg-primary-dim text-primary-foreground hover:bg-primary-foreground-dim hover:text-primary-dim"
                >
                    Details
                </Button>
            </div>
        </div>
    );
};

export default PeakPopup;
