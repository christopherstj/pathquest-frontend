"use client";
import React from "react";
import { Grid2 as Grid, Typography } from "@mui/material";
import { Metadata } from "next";
import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/router";

export const metadata: Metadata = {
    title: "PathQuest | Logout",
    description:
        "PathQuest is a modern adventure catalog and challenge tracker.",
};

const page = () => {
    const { data } = useSession();

    const router = useRouter();

    if (!data) {
        return router.push("/login");
    }

    const logout = async () => {
        await signOut({
            redirect: true,
            callbackUrl: "/login",
        });
    };

    React.useEffect(() => {
        logout();
    }, []);

    return (
        <Grid container spacing={1} minHeight="100%">
            <Grid
                size={{ xs: 12 }}
                display="flex"
                justifyContent="center"
                alignItems="center"
            >
                <Typography variant="h6" color="primary.onContainer">
                    Logging out...
                </Typography>
            </Grid>
        </Grid>
    );
};

export default page;
