import ThemeProvider from "@/providers/ThemeProvider";
import { Analytics } from "@vercel/analytics/react";
import { Metadata } from "next";
import { Fraunces, IBM_Plex_Mono } from "next/font/google";
import React from "react";
import NextAuthProvider from "@/providers/NextAuthProvider";
import QueryProvider from "@/providers/QueryProvider";
import MapProvider from "@/providers/MapProvider";
import AuthModalProvider from "@/providers/AuthModalProvider";
import DashboardProvider from "@/providers/DashboardProvider";
import SummitReportProvider from "@/providers/SummitReportProvider";
import ManualSummitProvider from "@/providers/ManualSummitProvider";
import "./globals.css";

const fraunces = Fraunces({
    variable: "--font-display",
    subsets: ["latin"],
    display: "swap",
    weight: ["400", "500", "600", "700"],
});

const plexMono = IBM_Plex_Mono({
    variable: "--font-mono",
    subsets: ["latin"],
    display: "swap",
    weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
    title: "PathQuest",
    description: "Digital topography for peak baggers and challenge seekers.",
};

type Props = {
    children: React.ReactNode;
};

import MapBackground from "@/components/map/MapBackground";
import GlobalNavigation from "@/components/app/layout/GlobalNavigation";
import UrlOverlayManager from "@/components/overlays/UrlOverlayManager";
import AuthModal from "@/components/auth/AuthModal";
import DashboardPanel from "@/components/overlays/DashboardPanel";
import SummitReportModal from "@/components/overlays/SummitReportModal";
import AddManualSummitModal from "@/components/overlays/AddManualSummitModal";

const layout = ({ children }: Props) => {
    return (
        <html lang="en" suppressHydrationWarning>
            <head>
                <meta
                    name="viewport"
                    content="width=device-width, initial-scale=1.0"
                />
                <link rel="icon" href="/favicon.ico" />
            </head>
            <body
                className={`${fraunces.variable} ${plexMono.variable} antialiased bg-background text-foreground overflow-hidden`}
            >
                <NextAuthProvider>
                    <QueryProvider>
                        <ThemeProvider
                            attribute="class"
                            defaultTheme="dark"
                            enableSystem={false}
                        >
                            <MapProvider>
                                <AuthModalProvider>
                                    <DashboardProvider>
                                        <SummitReportProvider>
                                            <ManualSummitProvider>
                                                <main className="relative w-full h-screen overflow-hidden">
                                                    <MapBackground />
                                                    <GlobalNavigation />
                                                    {/* URL-driven overlay manager - renders discovery drawer (desktop) or bottom sheet (mobile) and detail panels */}
                                                    <UrlOverlayManager />
                                                    {/* SEO content from static pages (hidden from view, visible to crawlers) */}
                                                    <div className="relative z-10 w-full h-full pointer-events-none">
                                                        {children}
                                                    </div>
                                                    {/* Auth modal - triggered by useRequireAuth hook */}
                                                    <AuthModal />
                                                    {/* Dashboard panel - for logged in users */}
                                                    <DashboardPanel />
                                                    {/* Summit report modal - for editing summit experiences */}
                                                    <SummitReportModal />
                                                    {/* Manual summit modal - for logging new summits */}
                                                    <AddManualSummitModal />
                                                </main>
                                            </ManualSummitProvider>
                                        </SummitReportProvider>
                                    </DashboardProvider>
                                </AuthModalProvider>
                            </MapProvider>
                        </ThemeProvider>
                    </QueryProvider>
                </NextAuthProvider>
                <Analytics />
            </body>
        </html>
    );
};

export default layout;
