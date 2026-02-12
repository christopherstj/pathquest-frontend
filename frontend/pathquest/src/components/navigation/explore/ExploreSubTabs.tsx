"use client";

import React from "react";
import { BarChart3, BookOpen, Cloud, Mountain, Trophy, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { ExploreContentType } from "@/hooks/use-explore-route";
import { ExploreSubTab } from "@/store/tabStore";

interface SubTabButtonProps {
    icon: React.ReactNode;
    label: string;
    isActive: boolean;
    onClick: () => void;
}

const SubTabButton = ({ icon, label, isActive, onClick }: SubTabButtonProps) => {
    return (
        <button
            onClick={onClick}
            className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all whitespace-nowrap flex-shrink-0",
                isActive
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
            )}
            aria-label={label}
            aria-selected={isActive}
            role="tab"
        >
            {icon}
            {label}
        </button>
    );
};

interface ExploreSubTabsProps {
    contentType: ExploreContentType;
    exploreSubTab: ExploreSubTab;
    onChangeSubTab: (subTab: ExploreSubTab) => void;
}

export const ExploreSubTabs = ({ contentType, exploreSubTab, onChangeSubTab }: ExploreSubTabsProps) => {
    if (contentType === "peak") {
        return (
            <div className="flex gap-0.5 bg-muted/50 p-0.5 rounded-lg">
                <SubTabButton
                    icon={<Cloud className="w-3.5 h-3.5" />}
                    label="Conditions"
                    isActive={exploreSubTab === "conditions"}
                    onClick={() => onChangeSubTab("conditions")}
                />
                <SubTabButton
                    icon={<Users className="w-3.5 h-3.5" />}
                    label="Community"
                    isActive={exploreSubTab === "community"}
                    onClick={() => onChangeSubTab("community")}
                />
                <SubTabButton
                    icon={<BookOpen className="w-3.5 h-3.5" />}
                    label="Journal"
                    isActive={exploreSubTab === "myActivity"}
                    onClick={() => onChangeSubTab("myActivity")}
                />
            </div>
        );
    }

    if (contentType === "challenge" || contentType === "userChallenge") {
        return (
            <div className="flex gap-0.5 bg-muted/50 p-0.5 rounded-lg">
                <SubTabButton
                    icon={<Trophy className="w-3.5 h-3.5" />}
                    label="Progress"
                    isActive={exploreSubTab === "progress"}
                    onClick={() => onChangeSubTab("progress")}
                />
                <SubTabButton
                    icon={<Mountain className="w-3.5 h-3.5" />}
                    label="Peaks"
                    isActive={exploreSubTab === "peaks"}
                    onClick={() => onChangeSubTab("peaks")}
                />
            </div>
        );
    }

    if (contentType === "activity") {
        return (
            <div className="flex gap-0.5 bg-muted/50 p-0.5 rounded-lg">
                <SubTabButton
                    icon={<Mountain className="w-3.5 h-3.5" />}
                    label="Details"
                    isActive={exploreSubTab === "details"}
                    onClick={() => onChangeSubTab("details")}
                />
                <SubTabButton
                    icon={<Mountain className="w-3.5 h-3.5" />}
                    label="Summits"
                    isActive={exploreSubTab === "summits"}
                    onClick={() => onChangeSubTab("summits")}
                />
                <SubTabButton
                    icon={<BarChart3 className="w-3.5 h-3.5" />}
                    label="Analytics"
                    isActive={exploreSubTab === "analytics"}
                    onClick={() => onChangeSubTab("analytics")}
                />
            </div>
        );
    }

    if (contentType === "profile") {
        return (
            <div className="flex gap-0.5 bg-muted/50 p-0.5 rounded-lg overflow-x-auto scrollbar-none">
                <SubTabButton
                    icon={<BarChart3 className="w-3.5 h-3.5" />}
                    label="Stats"
                    isActive={exploreSubTab === "stats"}
                    onClick={() => onChangeSubTab("stats")}
                />
                <SubTabButton
                    icon={<Mountain className="w-3.5 h-3.5" />}
                    label="Peaks"
                    isActive={exploreSubTab === "peaks"}
                    onClick={() => onChangeSubTab("peaks")}
                />
                <SubTabButton
                    icon={<BookOpen className="w-3.5 h-3.5" />}
                    label="Journal"
                    isActive={exploreSubTab === "details"}
                    onClick={() => onChangeSubTab("details")}
                />
                <SubTabButton
                    icon={<Trophy className="w-3.5 h-3.5" />}
                    label="Challenges"
                    isActive={exploreSubTab === "summits"}
                    onClick={() => onChangeSubTab("summits")}
                />
            </div>
        );
    }

    return null;
};


