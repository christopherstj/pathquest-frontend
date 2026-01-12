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
import UserManagementProvider from "@/providers/UserManagementProvider";
import OnboardingProvider from "@/providers/OnboardingProvider";
import AppShell from "@/components/app/layout/AppShell";
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

const layout = ({ children }: Props) => {
    return (
        <html lang="en" suppressHydrationWarning>
            <head>
                <meta
                    name="viewport"
                    content="width=device-width, initial-scale=1.0"
                />
            </head>
            <body
                className={`${fraunces.variable} ${plexMono.variable} antialiased bg-background text-foreground`}
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
                                                <UserManagementProvider>
                                                    <OnboardingProvider>
                                                        <AppShell>
                                                            {children}
                                                        </AppShell>
                                                    </OnboardingProvider>
                                                </UserManagementProvider>
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
