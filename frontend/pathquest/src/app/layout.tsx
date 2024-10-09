import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import Contexts from "@/components/Contexts";
import { Box, SxProps } from "@mui/material";
import Sidebar from "@/components/layout/Sidebar";
import { Home, QuestionMark } from "@mui/icons-material";
import InitColorSchemeScript from "@mui/material/InitColorSchemeScript";
import { Raleway, Merriweather_Sans } from "next/font/google";

const raleway = Raleway({
    variable: "--font-raleway",
    subsets: ["latin"],
});

const merriweatherSans = Merriweather_Sans({
    variable: "--font-merriweather-sans",
    subsets: ["latin"],
});

export const metadata: Metadata = {
    title: "PathQuest | Home",
    description:
        "PathQuest is a modern adventure catalog and challenge tracker.",
};

const rootContainerStyles: SxProps = {
    display: "grid",
    gridTemplateColumns: "80px 1fr",
    width: "100vw",
    height: "100vh",
    backgroundColor: "background.default",
};

const contentContainerStyles: SxProps = {
    width: "100%",
    minHeight: "100vh",
    padding: {
        xs: "8px",
        md: "16px",
    },
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const links = [
        {
            href: "/",
            label: "Home",
            icon: <Home />,
        },
        // {
        //     href: "/about",
        //     label: "About",
        //     icon: <QuestionMark />,
        // },
    ];
    return (
        <html lang="en" suppressHydrationWarning>
            <body
                className={`${raleway.variable} ${merriweatherSans.variable}`}
            >
                <InitColorSchemeScript attribute="class" />
                <Contexts>
                    <Box sx={rootContainerStyles}>
                        <Sidebar links={links} />
                        <Box sx={contentContainerStyles}>{children}</Box>
                    </Box>
                </Contexts>
            </body>
        </html>
    );
}
