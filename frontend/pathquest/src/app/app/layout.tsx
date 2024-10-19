import getPeakSummits from "@/actions/getPeakSummits";
import { useAuth } from "@/auth/useAuth";
import ChallengeData from "@/state/ChallengeData";
import PeaksData from "@/state/PeaksData";
import { Metadata } from "next";
import { redirect } from "next/navigation";
import React from "react";

export const metadata: Metadata = {
    title: "PathQuest | Dashboard",
    description:
        "PathQuest is a modern adventure catalog and challenge tracker.",
};

type Props = {
    children: React.ReactNode;
};

const layout = async ({ children }: Props) => {
    const session = await useAuth();

    if (!session) {
        redirect("/login");
    }

    return (
        <PeaksData>
            <ChallengeData>{children}</ChallengeData>
        </PeaksData>
    );
};

export default layout;
