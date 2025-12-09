"use client";

import React, { Suspense } from "react";
import Omnibar from "@/components/search/Omnibar";
import { User } from "lucide-react";
import Link from "next/link";
import Logo from "@/components/brand/Logo";

const GlobalNavigation = () => {
    return (
        <div className="fixed top-0 left-0 w-full z-50 pointer-events-none p-4 md:p-6 flex items-start justify-between gap-4">
            {/* Logo Area */}
            <Link 
                href="/" 
                className="hidden md:flex items-center gap-2.5 pointer-events-auto bg-card/80 backdrop-blur-md px-3 py-2 rounded-xl border border-border hover:border-primary/30 transition-colors shadow-lg group"
                aria-label="PathQuest home"
            >
                <Logo size={28} className="text-secondary group-hover:text-primary transition-colors" />
                <span className="text-xs font-semibold uppercase tracking-[0.15em] text-secondary/70 group-hover:text-primary/80 transition-colors">
                    PathQuest
                </span>
            </Link>

            {/* Center Omnibar */}
            <div className="flex-1 max-w-lg">
                <Suspense fallback={<div className="h-12 w-full bg-white/5 rounded-xl animate-pulse" />}>
                    <Omnibar />
                </Suspense>
            </div>

            {/* User/Menu Area */}
            <div className="pointer-events-auto">
                <Link href="/login" className="flex items-center justify-center w-10 h-10 rounded-full bg-card/80 backdrop-blur border border-border hover:bg-card hover:border-primary/50 transition-all shadow-lg">
                    <User className="w-5 h-5 text-muted-foreground" />
                </Link>
            </div>
        </div>
    );
};

export default GlobalNavigation;

