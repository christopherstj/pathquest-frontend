import Peak from "@/typeDefs/Peak";
import {
    Check,
    CircleCheckBig,
    MapPin,
    MountainSnow,
    Star,
    User,
    Users,
} from "lucide-react";
import React from "react";
import CenterButton from "./CenterButton";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import metersToFt from "@/helpers/metersToFt";

type Props = {
    peak: Peak;
};

const PeakRow = ({ peak }: Props) => {
    const isSummited = peak.summits !== undefined && peak.summits > 0;

    const color = isSummited ? "secondary" : "primary";

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

    return (
        <Link
            href={`peaks/${peak.id}`}
            className={`mb-1 relative rounded-lg p-2 cursor-pointer w-full flex duration-200 ${
                isSummited
                    ? "bg-gradient-to-r from-secondary to-secondary-foreground/30 hover:bg-secondary-dim"
                    : peak.num_challenges && peak.num_challenges > 0
                    ? "bg-gradient-to-r from-primary to-primary-foreground/30 hover:bg-primary-dim"
                    : "bg-primary hover:bg-primary-dim"
            }`}
        >
            <div className="flex flex-col basis-full justify-center items-start px-2">
                <div className="flex gap-1 justify-start items-center w-full">
                    <h3
                        className={`text-md font-semibold ${
                            isSummited
                                ? "text-secondary-foreground-base"
                                : "text-primary-foreground-base"
                        }`}
                    >
                        {peak.name || "Unnamed Peak"}
                    </h3>
                    {peak.location_coords && (
                        <CenterButton
                            color={color}
                            lat={peak.location_coords[1]}
                            lng={peak.location_coords[0]}
                        />
                    )}
                </div>
                {peak.elevation && (
                    <p
                        className={`text-sm ${
                            isSummited
                                ? "text-secondary-foreground"
                                : "text-primary-foreground"
                        }`}
                    >
                        {metersToFt(peak.elevation).toFixed(0)} ft
                    </p>
                )}
                <p
                    className={`text-xs ${
                        isSummited
                            ? "text-secondary-foreground-dim"
                            : "text-primary-foreground-dim"
                    }`}
                >
                    {peak.country ? `${peak.country}` : ""}
                    {peak.state ? ` • ${peak.state}` : ""}
                    {peak.county ? ` • ${peak.county}` : ""}
                </p>
                <div className="flex gap-2">
                    {peak.public_summits !== undefined &&
                        peak.public_summits > 0 && (
                            <div className="flex items-center gap-1">
                                <Users
                                    size={12}
                                    className={
                                        isSummited
                                            ? "text-secondary-foreground"
                                            : "text-primary-foreground"
                                    }
                                />
                                <p
                                    className={`text-sm ${
                                        isSummited
                                            ? "text-secondary-foreground"
                                            : "text-primary-foreground"
                                    }`}
                                >
                                    {peak.public_summits !== undefined &&
                                    peak.public_summits > 0
                                        ? peak.public_summits
                                        : ""}
                                </p>
                            </div>
                        )}
                    {isSummited && (
                        <div className="flex items-center gap-1">
                            <User
                                size={12}
                                className="text-secondary-foreground"
                            />
                            <p className="text-secondary-foreground font-bold">
                                {peak.summits}
                            </p>
                        </div>
                    )}
                </div>
            </div>
            {badges.length > 0 && (
                <div className="absolute top-0 right-2 flex gap-1">
                    {badges}
                </div>
            )}
        </Link>
    );
};

export default PeakRow;
