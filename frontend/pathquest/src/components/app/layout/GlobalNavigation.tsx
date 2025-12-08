"use client";

import React, { Suspense } from "react";
import Omnibar from "@/components/search/Omnibar";
import { User } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import logo from "@/public/images/logo-no-background.svg";

const GlobalNavigation = () => {
    return (
        <div className="fixed top-0 left-0 w-full z-50 pointer-events-none p-4 md:p-6 flex items-start justify-between gap-4">
            {/* Logo Area */}
            <div className="hidden md:flex items-center gap-2 pointer-events-auto bg-background/20 backdrop-blur-md p-2 rounded-xl border border-white/5">
                 <Image src={logo} alt="PathQuest" width={32} height={32} className="opacity-90" />
            </div>

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

