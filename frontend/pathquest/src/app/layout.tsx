import type { Metadata } from "next";
import "./globals.css";
import Contexts from "@/components/Contexts";
import { Box, GlobalStyles, SxProps } from "@mui/material";
import InitColorSchemeScript from "@mui/material/InitColorSchemeScript";
import { Raleway, Merriweather_Sans } from "next/font/google";
import Nav from "@/components/layout/Nav";
import UserData from "@/state/UserData";
import Message from "@/components/common/Message";
import MessageProvider from "@/state/MessageContext";

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

const rootContainerStyles: SxProps = {
    display: "grid",
    gridTemplateColumns: {
        xs: "1fr",
        md: "80px 1fr",
    },
    width: "100vw",
    minHeight: "100vh",
    backgroundColor: "background.default",
};

const contentContainerStyles: SxProps = {
    width: "100%",
    minHeight: "100vh",
    position: "relative",
    padding: {
        xs: "8px",
        md: "16px",
    },
    paddingBottom: {
        xs: "72px",
        md: "16px",
    },
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" suppressHydrationWarning>
            <body
                className={`${raleway.variable} ${merriweatherSans.variable}`}
            >
                <InitColorSchemeScript attribute="class" />
                <Contexts>
                    <UserData>
                        <MessageProvider>
                            <Box sx={rootContainerStyles}>
                                <Nav />
                                <Box sx={contentContainerStyles}>
                                    {children}
                                    <Message />
                                </Box>
                            </Box>
                        </MessageProvider>
                    </UserData>
                </Contexts>
            </body>
        </html>
    );
}
