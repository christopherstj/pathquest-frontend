import getPublicPeakDetails from "@/actions/peaks/getPeakDetails";
import PeakDetailMapInteraction from "@/components/app/peaks/PeakDetailMapInteraction";
import PeakTitle from "@/components/app/peaks/PeakTitle";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import React from "react";

type Props = {
    params: {
        id: string;
    };
};

const page = async (props: Props) => {
    const { id } = props.params;

    const { data } = await getPublicPeakDetails(id);

    if (!data || !data.peak) {
        return (
            <div className="flex flex-col items-center justify-center h-full">
                <h1 className="text-2xl font-bold mb-4">Peak Not Found</h1>
                <p className="mb-4">
                    The peak you are looking for does not exist or is not
                    available.
                </p>
                <Button asChild className="rounded-full bg-accent text-white">
                    <Link href="/m/peaks">
                        <ArrowLeft className="mr-2" /> Back to Peaks
                    </Link>
                </Button>
            </div>
        );
    }

    const { peak, activities, challenges, publicSummits } = data;

    return (
        <>
            <div className="absolute pointer-events-none inset-0 grid grid-cols-[160px_minmax(0,1fr)] md:grid-cols-[160px_minmax(0,1fr)_250px] lg:grid-cols-[160px_minmax(0,1fr)_300px] p-2.5 gap-2">
                <PeakDetailMapInteraction peak={peak} activities={activities} />
                {/* spacer for grid */}
                <div className="w-full h-0 flex items-start pointer-events-auto gap-2">
                    <PeakTitle
                        name={peak.name || "Unnamed Peak"}
                        elevation={peak.elevation || 0}
                        location={`${peak.country ? `${peak.country}` : ""}
                    ${peak.county ? ` • ${peak.county}` : ""}
                    ${peak.state ? ` • ${peak.state}` : ""}`}
                    />
                </div>
            </div>
        </>
    );
};

export default page;
