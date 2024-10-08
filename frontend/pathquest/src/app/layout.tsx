import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import Contexts from "@/components/Contexts";
import { Box, SxProps } from "@mui/material";
import Sidebar from "@/components/layout/Sidebar";
import { Home, QuestionMark } from "@mui/icons-material";

const bicyclette = localFont({
    variable: "--font-bicyclette",
    src: [
        {
            path: "./fonts/Bicyclette-Thin.woff",
            weight: "100 200",
            style: "normal",
        },
        {
            path: "./fonts/Bicyclette-Light.woff",
            weight: "300",
            style: "normal",
        },
        {
            path: "./fonts/Bicyclette-Regular.woff",
            weight: "400",
            style: "normal",
        },
        {
            path: "./fonts/Bicyclette-Italic.woff",
            weight: "400",
            style: "italic",
        },
        {
            path: "./fonts/Bicyclette-Bold.woff",
            weight: "500 600",
            style: "normal",
        },
        {
            path: "./fonts/Bicyclette-Black.woff",
            weight: "700",
            style: "normal",
        },
        {
            path: "./fonts/Bicyclette-Ultra.woff",
            weight: "800 900",
            style: "normal",
        },
    ],
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
    height: "100%",
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
        <html lang="en">
            <body className={`${bicyclette.variable}`}>
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
