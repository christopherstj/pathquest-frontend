import ThemeProvider from "@/providers/ThemeProvider";
import { Analytics } from "@vercel/analytics/react";
import { Metadata } from "next";
import { Merriweather_Sans, Raleway } from "next/font/google";
import React from "react";
import { SessionProvider } from "next-auth/react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import NextAuthProvider from "@/providers/NextAuthProvider";
import { AppSidebar } from "@/components/app/layout/AppSidebar";
import "./globals.css";

const raleway = Raleway({
    variable: "--font-raleway",
    subsets: ["latin"],
    display: "swap",
});

const merriweatherSans = Merriweather_Sans({
    variable: "--font-merriweather-sans",
    subsets: ["latin"],
    display: "swap",
});

export const metadata: Metadata = {
    title: "PathQuest | Home",
    description:
        "PathQuest is a modern adventure catalog and challenge tracker.",
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
                <link rel="icon" href="/favicon.ico" />
                <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
            </head>
            <body
                className={`${raleway.variable} ${merriweatherSans.variable}`}
            >
                <NextAuthProvider>
                    <ThemeProvider
                        attribute="class"
                        defaultTheme="dark"
                        enableSystem={false}
                    >
                        <SidebarProvider>
                            <main className="w-full min-h-screen">
                                {/* <AppSidebar /> */}
                                {children}
                            </main>
                        </SidebarProvider>
                    </ThemeProvider>
                </NextAuthProvider>
                <Analytics />
            </body>
        </html>
    );
};

export default layout;
