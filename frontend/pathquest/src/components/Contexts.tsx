"use client";
import React from "react";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v14-appRouter";
import { ThemeProvider } from "@mui/material";
import { theme } from "@/theme/theme";
import { SessionProvider } from "next-auth/react";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";

type Props = {
    children: React.ReactNode;
};

const Contexts = ({ children }: Props) => {
    return (
        <LocalizationProvider dateAdapter={AdapterDayjs}>
            <SessionProvider>
                <AppRouterCacheProvider>
                    <ThemeProvider theme={theme}>{children}</ThemeProvider>
                </AppRouterCacheProvider>
            </SessionProvider>
        </LocalizationProvider>
    );
};

export default Contexts;
