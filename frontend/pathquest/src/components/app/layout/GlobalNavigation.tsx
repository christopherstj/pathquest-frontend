"use client";

import React, { Suspense } from "react";
import Omnibar from "@/components/search/Omnibar";
import { User, LayoutDashboard, LogIn } from "lucide-react";
import Link from "next/link";
import Logo from "@/components/brand/Logo";
import { useIsAuthenticated } from "@/hooks/useRequireAuth";
import { useAuthModalStore } from "@/providers/AuthModalProvider";
import { useDashboardStore } from "@/providers/DashboardProvider";
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/components/ui/tooltip";

const GlobalNavigation = () => {
    const { isAuthenticated, user } = useIsAuthenticated();
    const openLoginModal = useAuthModalStore((state) => state.openLoginModal);
    const toggleDashboard = useDashboardStore((state) => state.toggleDashboard);
    const isDashboardOpen = useDashboardStore((state) => state.isOpen);

    const handleLoginClick = () => {
        openLoginModal();
    };

    const handleDashboardClick = () => {
        toggleDashboard();
    };

    return (
        <div className="fixed top-0 left-0 w-full z-50 pointer-events-none p-4 md:p-6 flex items-start justify-between gap-4">
            {/* Logo Area */}
            <Link
                href="/"
                className="hidden md:flex items-center gap-2.5 pointer-events-auto bg-card/80 backdrop-blur-md px-3 py-2 rounded-xl border border-border hover:border-primary/30 transition-colors shadow-lg group"
                aria-label="PathQuest home"
            >
                <Logo
                    size={28}
                    className="text-secondary group-hover:text-primary transition-colors"
                />
                <span className="text-xs font-semibold uppercase tracking-[0.15em] text-secondary/70 group-hover:text-primary/80 transition-colors">
                    PathQuest
                </span>
            </Link>

            {/* Center Omnibar */}
            <div className="flex-1 max-w-lg">
                <Suspense
                    fallback={
                        <div className="h-12 w-full bg-white/5 rounded-xl animate-pulse" />
                    }
                >
                    <Omnibar />
                </Suspense>
            </div>

            {/* User/Menu Area */}
            <div className="pointer-events-auto flex items-center gap-2">
                {isAuthenticated ? (
                    <>
                        {/* Dashboard Button */}
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <button
                                    onClick={handleDashboardClick}
                                    className={`flex items-center justify-center w-10 h-10 rounded-full bg-card/80 backdrop-blur border transition-all shadow-lg ${
                                        isDashboardOpen
                                            ? "border-primary bg-primary/10"
                                            : "border-border hover:bg-card hover:border-primary/50"
                                    }`}
                                    aria-label="Open dashboard"
                                    aria-expanded={isDashboardOpen}
                                    tabIndex={0}
                                >
                                    <LayoutDashboard
                                        className={`w-5 h-5 ${
                                            isDashboardOpen
                                                ? "text-primary"
                                                : "text-muted-foreground"
                                        }`}
                                    />
                                </button>
                            </TooltipTrigger>
                            <TooltipContent side="bottom">
                                <p>Your Dashboard</p>
                            </TooltipContent>
                        </Tooltip>

                        {/* User Avatar */}
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <button
                                    className="flex items-center justify-center w-10 h-10 rounded-full bg-card/80 backdrop-blur border border-border hover:bg-card hover:border-primary/50 transition-all shadow-lg overflow-hidden"
                                    aria-label="User menu"
                                    tabIndex={0}
                                >
                                    {user?.image ? (
                                        <img
                                            src={user.image}
                                            alt={user.name || "User"}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <User className="w-5 h-5 text-muted-foreground" />
                                    )}
                                </button>
                            </TooltipTrigger>
                            <TooltipContent side="bottom">
                                <p>{user?.name || "Account"}</p>
                            </TooltipContent>
                        </Tooltip>
                    </>
                ) : (
                    /* Login Button */
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <button
                                onClick={handleLoginClick}
                                className="flex items-center justify-center gap-2 px-4 h-10 rounded-full bg-primary/90 backdrop-blur border border-primary hover:bg-primary transition-all shadow-lg text-primary-foreground"
                                aria-label="Log in"
                                tabIndex={0}
                            >
                                <LogIn className="w-4 h-4" />
                                <span className="text-sm font-medium hidden sm:inline">
                                    Log in
                                </span>
                            </button>
                        </TooltipTrigger>
                        <TooltipContent side="bottom">
                            <p>Log in with Strava</p>
                        </TooltipContent>
                    </Tooltip>
                )}
            </div>
        </div>
    );
};

export default GlobalNavigation;

