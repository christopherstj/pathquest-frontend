import getPublicPeakDetails from "@/actions/peaks/getPublicPeakDetails";
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

    const peakDetails = await getPublicPeakDetails(id);

    return (
        <>
            <div className="absolute pointer-events-none inset-0 grid grid-cols-[32px_minmax(0,1fr)] md:grid-cols-[32px_minmax(0,1fr)_250px] lg:grid-cols-[32px_minmax(0,1fr)_300px] p-2.5 gap-2">
                <div></div> {/* spacer for grid */}
                <div className="w-full flex items-start pointer-events-auto gap-2">
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
                    <PeakTitle
                        name={peakDetails.data?.Name || ""}
                        elevation={peakDetails.data?.Altitude || 0}
                        location={`${
                            peakDetails.data?.Country
                                ? `${peakDetails.data?.Country}`
                                : ""
                        }
                    ${
                        peakDetails.data?.County
                            ? ` • ${peakDetails.data?.County}`
                            : ""
                    }
                    ${
                        peakDetails.data?.State
                            ? ` • ${peakDetails.data?.State}`
                            : ""
                    }`}
                    />
                </div>
            </div>
        </>
    );
};

export default page;
