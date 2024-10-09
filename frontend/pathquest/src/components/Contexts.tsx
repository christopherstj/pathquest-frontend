"use client";
import React from "react";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v14-appRouter";
import { ThemeProvider } from "@mui/material";
import { theme } from "@/theme/theme";
import { SessionProvider } from "next-auth/react";

type Props = {
    children: React.ReactNode;
};

const Contexts = ({ children }: Props) => {
    return (
        <SessionProvider>
            <AppRouterCacheProvider>
                <ThemeProvider theme={theme}>{children}</ThemeProvider>
            </AppRouterCacheProvider>
        </SessionProvider>
    );
};

export default Contexts;
