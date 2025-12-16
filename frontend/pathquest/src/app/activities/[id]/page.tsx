"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/**
 * Activity Detail Page - Dynamic route (no ISR)
 * 
 * This page acts as a landing page for direct URL access to activities.
 * The visual overlay is rendered by UrlOverlayManager in the root layout,
 * which reads the pathname and shows the appropriate panel.
 * 
 * Unlike peaks/challenges, activities are NOT statically generated because:
 * 1. There are potentially millions of activities in the database
 * 2. Activities have strict privacy controls
 * 3. Most activities are accessed via in-app navigation
 * 
 * Privacy is enforced at the data fetching level (getActivityDetails action).
 */
const ActivityPage = () => {
    // This page is a client component that relies on UrlOverlayManager
    // to render the actual content via the ActivityDetailPanel.
    // The page itself is just a wrapper for URL-based routing.
    
    return null;
};

export default ActivityPage;

