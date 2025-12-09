"use client";

import React, { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Mountain } from "lucide-react";
import { usePathname } from "next/navigation";
import { useDashboardStore } from "@/providers/DashboardProvider";
import { useIsAuthenticated } from "@/hooks/useRequireAuth";
import { useIsMobile } from "@/hooks/use-mobile";
import DashboardContent from "./DashboardContent";

const DashboardPanel = () => {
    const isOpen = useDashboardStore((state) => state.isOpen);
    const openDashboard = useDashboardStore((state) => state.openDashboard);
    const closeDashboard = useDashboardStore((state) => state.closeDashboard);
    const { isAuthenticated, isLoading: authLoading, user } = useIsAuthenticated();
    const isMobile = useIsMobile(1024);
    const pathname = usePathname();
    const hasAutoOpened = useRef(false);

    // Check if we're on a detail page (peak or challenge)
    const isDetailPage = pathname?.startsWith("/peaks/") || pathname?.startsWith("/challenges/");
    const isLandingPage = pathname === "/" || pathname === "";

    // Auto-open dashboard on desktop when user is authenticated and on landing page (only once)
    useEffect(() => {
        if (!authLoading && isAuthenticated && !isMobile && !hasAutoOpened.current && isLandingPage) {
            hasAutoOpened.current = true;
            openDashboard();
        }
    }, [authLoading, isAuthenticated, isMobile, openDashboard, isLandingPage]);

    // Close dashboard when navigating to a detail page (peak or challenge)
    useEffect(() => {
        if (isDetailPage && isOpen) {
            closeDashboard();
        }
    }, [isDetailPage, isOpen, closeDashboard]);

    // Don't render if auth is still loading or user is not authenticated
    if (authLoading || !isAuthenticated) {
        return null;
    }

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ x: 100, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: 100, opacity: 0 }}
                    transition={{ type: "spring", damping: 25, stiffness: 300 }}
                    className="fixed top-20 right-3 md:right-5 bottom-6 w-[calc(100%-1.5rem)] md:w-[360px] max-w-[360px] pointer-events-auto z-40 flex flex-col hidden md:flex"
                >
                    <div className="flex-1 rounded-2xl bg-background/85 backdrop-blur-xl border border-border shadow-xl overflow-hidden flex flex-col">
                        {/* Header */}
                        <div className="p-5 border-b border-border/60 bg-gradient-to-b from-primary/5 to-transparent relative">
                            <button
                                onClick={closeDashboard}
                                className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/10 text-muted-foreground hover:text-foreground transition-colors"
                                aria-label="Close dashboard"
                                tabIndex={0}
                            >
                                <X className="w-4 h-4" />
                            </button>

                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                                    <Mountain className="w-5 h-5 text-primary" />
                                </div>
                                <div>
                                    <h1
                                        className="text-xl font-bold text-foreground"
                                        style={{
                                            fontFamily: "var(--font-display)",
                                        }}
                                    >
                                        Your Dashboard
                                    </h1>
                                    <p className="text-sm text-muted-foreground">
                                        {user?.name || "Explorer"}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="flex-1 overflow-y-auto p-5 custom-scrollbar">
                            <DashboardContent isActive={isOpen} />
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default DashboardPanel;
