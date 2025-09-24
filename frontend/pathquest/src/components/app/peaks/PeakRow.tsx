"use client";
import { Button } from "@/components/ui/button";
import Peak from "@/typeDefs/Peak";
import { Check, MapPin, MountainSnow, Star } from "lucide-react";
import React from "react";
import CenterButton from "./CenterButton";

type Props = {
    peak: Peak;
};

const PeakRow = ({ peak }: Props) => {
    return (
        <div className="rounded-lg p-2 pl-3 bg-primary hover:bg-primary-dim cursor-pointer w-full flex duration-200">
            <div className="flex flex-col basis-[50px] justify-center items-center">
                {peak.isSummitted ? (
                    <div className="w-[40px] h-[40px] bg-primary-dim rounded-full text-primary-foreground-dim flex justify-center items-center">
                        <Check />
                    </div>
                ) : (
                    <div className="w-[40px] h-[40px] bg-primary-dim rounded-full text-primary-foreground-dim flex justify-center items-center">
                        <MountainSnow />
                    </div>
                )}
            </div>
            <div className="flex flex-col basis-full justify-center items-start px-4">
                <h3 className="text-md font-semibold text-primary-foreground-base">
                    {peak.Name}
                </h3>
                <p className="text-sm text-primary-foreground">
                    {peak.Altitude}m
                </p>
                <p className="text-xs text-primary-foreground-dim">
                    {peak.Country ? `${peak.Country}` : ""}
                    {peak.County ? ` • ${peak.County}` : ""}
                    {peak.State ? ` • ${peak.State}` : ""}
                </p>
            </div>
            <div className="flex flex-col basis-[40px] justify-center items-end">
                <CenterButton lat={peak.Lat} lng={peak.Long} />
            </div>
        </div>
    );
};

export default PeakRow;
