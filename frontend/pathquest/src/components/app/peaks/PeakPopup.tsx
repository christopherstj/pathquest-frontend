"use client";
import { Button } from "@/components/ui/button";
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import metersToFt from "@/helpers/metersToFt";
import { cn } from "@/lib/utils";
import Peak from "@/typeDefs/Peak";
import { ArrowRight, CircleCheckBig, Star } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React from "react";

type Props = {
    peak: Peak;
    onRouteChange?: () => void;
};

const PeakPopup = ({ peak, onRouteChange }: Props) => {
    const isSummited = peak.summits !== undefined && peak.summits > 0;

    const handleClick = () => {
        if (onRouteChange) {
            onRouteChange();
        }
    };

    const badges = [];

    if (peak.num_challenges && peak.num_challenges > 0) {
        badges.push(
            <Tooltip key="challenge-badge">
                <TooltipTrigger asChild>
                    <div className="flex flex-col justify-center items-center gap-1 rounded-b-full bg-primary-foreground-dim p-1 h-[32px]">
                        <Star className="text-primary-dim w-4 h-4" />
                    </div>
                </TooltipTrigger>
                <TooltipContent>
                    <p>This peak is part of a challenge!</p>
                </TooltipContent>
            </Tooltip>
        );
    }

    if (isSummited) {
        badges.push(
            <Tooltip key="summited-badge">
                <TooltipTrigger asChild>
                    <div className="flex flex-col justify-center items-center gap-0.5 rounded-b-full bg-secondary-foreground p-1 h-[32px]">
                        <CircleCheckBig className="text-secondary-dim w-4 h-4" />
                        {/* <p className="text-sm text-secondary-dim font-bold">
                            {peak.summits}
                        </p> */}
                    </div>
                </TooltipTrigger>
                <TooltipContent>
                    <p>
                        You've summited this peak {peak.summits} time
                        {peak.summits === 1 ? "" : "s"}!
                    </p>
                </TooltipContent>
            </Tooltip>
        );
    }

    const paddingRight = badges.length > 0 ? badges.length * 32 : 0;

    return (
        <div
            onClick={handleClick}
            className={cn(
                "max-w-[250px] p-2 rounded-lg shadow-lg flex flex-col cursor-pointer",
                {
                    "bg-primary": !isSummited,
                    "bg-secondary": isSummited,
                }
            )}
        >
            <div
                className="flex flex-col gap-2"
                style={
                    {
                        "--dynamic-margin": `${paddingRight}px`,
                    } as React.CSSProperties
                }
            >
                <div className="flex flex-col gap-1 mr-[var(--dynamic-margin)]">
                    <h5
                        className={cn("text-lg font-semibold w-full", {
                            "text-primary-foreground-base": !isSummited,
                            "text-secondary-foreground-base": isSummited,
                        })}
                    >
                        {peak.name || "Unnamed Peak"}
                    </h5>
                    {peak.elevation && (
                        <p
                            className={cn("text-sm", {
                                "text-primary-foreground-dim": !isSummited,
                                "text-secondary-foreground-dim": isSummited,
                            })}
                        >
                            Elevation:{" "}
                            <span
                                className={cn("font-bold", {
                                    "text-primary-foreground": !isSummited,
                                    "text-secondary-foreground": isSummited,
                                })}
                            >
                                {metersToFt(peak.elevation).toFixed(0)} ft
                            </span>
                        </p>
                    )}
                </div>
                <hr
                    className={cn("border", {
                        "border-primary-foreground": !isSummited,
                        "border-secondary-foreground": isSummited,
                    })}
                />
                <div className="flex flex-col gap-1">
                    <p
                        className={cn("text-xs", {
                            "text-primary-foreground-dim": !isSummited,
                            "text-secondary-foreground-dim": isSummited,
                        })}
                    >
                        Location
                    </p>
                    <p
                        className={cn("text-sm", {
                            "text-primary-foreground": !isSummited,
                            "text-secondary-foreground": isSummited,
                        })}
                    >
                        {peak.country ? `${peak.country}` : ""}
                        {peak.state ? ` • ${peak.state}` : ""}
                        {peak.county ? ` • ${peak.county}` : ""}
                    </p>
                </div>
                {(isSummited ||
                    (peak.public_summits !== undefined &&
                        peak.public_summits > 0)) && (
                    <div
                        className={cn("rounded-lg p-2 flex gap-1", {
                            "bg-primary-dim": !isSummited,
                            "bg-secondary-dim": isSummited,
                        })}
                    >
                        {peak.public_summits !== undefined &&
                            peak.public_summits > 0 && (
                                <div className="flex flex-col flex-1">
                                    <h5
                                        className={cn("text-lg", {
                                            "text-primary-foreground":
                                                !isSummited,
                                            "text-secondary-foreground":
                                                isSummited,
                                        })}
                                    >
                                        {peak.public_summits}
                                    </h5>
                                    <p
                                        className={cn("text-xs", {
                                            "text-primary-foreground-dim":
                                                !isSummited,
                                            "text-secondary-foreground-dim":
                                                isSummited,
                                        })}
                                    >
                                        Public Summits
                                    </p>
                                </div>
                            )}
                        {isSummited && (
                            <div className="flex flex-col flex-1">
                                <h5
                                    className={cn("text-lg", {
                                        "text-primary-foreground": !isSummited,
                                        "text-secondary-foreground": isSummited,
                                    })}
                                >
                                    {peak.summits}
                                </h5>
                                <p
                                    className={cn("text-xs", {
                                        "text-primary-foreground-dim":
                                            !isSummited,
                                        "text-secondary-foreground-dim":
                                            isSummited,
                                    })}
                                >
                                    Your Summits
                                </p>
                            </div>
                        )}
                    </div>
                )}

                <Button
                    size="sm"
                    className={cn("w-full cursor-pointer rounded-full", {
                        "bg-primary-dim text-primary-foreground hover:bg-primary-foreground-dim hover:text-primary-dim":
                            !isSummited,
                        "bg-secondary-dim text-secondary-foreground hover:bg-secondary-foreground-dim hover:text-secondary-dim":
                            isSummited,
                    })}
                >
                    View Details <ArrowRight />
                </Button>
            </div>
            {badges.length > 0 && (
                <div className="absolute top-0 right-2 flex gap-1">
                    {badges}
                </div>
            )}
        </div>
    );
};

export default PeakPopup;
