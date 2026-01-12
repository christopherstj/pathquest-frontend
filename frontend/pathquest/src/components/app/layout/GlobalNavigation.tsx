"use client";

import React, { Suspense } from "react";
import Link from "next/link";
import Omnibar from "@/components/search/Omnibar";
import { User, LogIn, LogOut, Settings } from "lucide-react";
import Logo from "@/components/brand/Logo";
import { useIsAuthenticated } from "@/hooks/useRequireAuth";
import { useAuthModalStore } from "@/providers/AuthModalProvider";
import { useUserManagementStore } from "@/providers/UserManagementProvider";
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { signOut } from "next-auth/react";

const GlobalNavigation = () => {
    const { isAuthenticated, user } = useIsAuthenticated();
    const openLoginModal = useAuthModalStore((state) => state.openLoginModal);
    const openUserManagement = useUserManagementStore((state) => state.openModal);

    const handleLoginClick = () => {
        openLoginModal();
    };

    const handleSettingsClick = () => {
        openUserManagement();
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
                    className="text-primary transition-colors"
                />
                <span className="text-sm font-semibold text-foreground dark:text-white transition-colors" style={{ fontFamily: "var(--font-display)" }}>
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
                        {/* User Avatar with Dropdown */}
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <button
                                    className="flex items-center justify-center w-10 h-10 rounded-full bg-card/80 backdrop-blur border border-border hover:bg-card hover:border-primary/50 transition-all shadow-lg overflow-hidden focus:outline-none focus:ring-2 focus:ring-primary/30"
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
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48" sideOffset={8}>
                                <div className="px-2 py-1.5 text-sm font-medium text-foreground truncate">
                                    {user?.name || "User"}
                                </div>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                    onClick={handleSettingsClick}
                                    className="flex items-center gap-2 cursor-pointer"
                                >
                                    <Settings className="w-4 h-4" />
                                    <span>Settings</span>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                    onClick={() => signOut()}
                                    className="flex items-center gap-2 cursor-pointer text-red-500 focus:text-red-500 focus:bg-red-500/10"
                                >
                                    <LogOut className="w-4 h-4" />
                                    <span>Logout</span>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
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

