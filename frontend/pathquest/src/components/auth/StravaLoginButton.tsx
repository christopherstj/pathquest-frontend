"use client";
import React from "react";
import { Button, SxProps } from "@mui/material";
import { signIn, signOut, useSession } from "next-auth/react";
import StravaIcon from "../common/customIcons/StravaIcon";

const buttonStyles: SxProps = {
    borderRadius: "24px",
    borderColor: "primary.onContainer",
    color: "primary.onContainer",
};

const StravaLoginButton = () => {
    const { data } = useSession();

    const logout = async () => {
        const res = await signOut();
    };

    const login = async () => {
        const res = await signIn("strava", {
            redirect: true,
            callbackUrl: `${window.location.origin}/app`,
        });
    };

    return data ? (
        <Button
            variant="outlined"
            sx={buttonStyles}
            fullWidth
            startIcon={<StravaIcon sx={{ color: "primary.onContainer" }} />}
            onClick={logout}
        >
            Logout
        </Button>
    ) : (
        <Button
            variant="outlined"
            sx={buttonStyles}
            fullWidth
            startIcon={<StravaIcon sx={{ color: "primary.onContainer" }} />}
            onClick={login}
        >
            Login with Strava
        </Button>
    );
};

export default StravaLoginButton;
