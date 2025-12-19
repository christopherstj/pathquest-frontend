"use client";

import React from "react";
import DashboardContent from "@/components/overlays/DashboardContent";

interface HomeTabContentProps {
    isActive: boolean;
}

/**
 * Home tab content - wraps the existing DashboardContent component.
 * This is where users see their personal dashboard:
 * - Hero summit card (recent unreviewed summits)
 * - Quick stats
 * - Challenge progress
 * - Recent activity
 */
const HomeTabContent = ({ isActive }: HomeTabContentProps) => {
    return (
        <div className="p-4">
            <DashboardContent isActive={isActive} showHeader={true} />
        </div>
    );
};

export default HomeTabContent;

