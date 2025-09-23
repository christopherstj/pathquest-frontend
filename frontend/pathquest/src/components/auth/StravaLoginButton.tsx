"use client";
import React from "react";
import { Button, SxProps } from "@mui/material";
import { signIn, signOut, useSession } from "next-auth/react";
import StravaIcon from "../common/customIcons/StravaIcon";
import Image from "next/image";
import stravaButton from "../../public/images/btn_strava_connectwith_light.svg";

const buttonStyles = (outlined: boolean): SxProps => ({
    borderRadius: "24px",
    borderColor: outlined ? "primary.onContainer" : "transparent",
    backgroundColor: outlined ? "transparent" : "white",
    color: "primary.onContainer",
});

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
            sx={buttonStyles(true)}
            fullWidth
            startIcon={<StravaIcon sx={{ color: "primary.onContainer" }} />}
            onClick={logout}
        >
            Logout
        </Button>
    ) : (
        <Button
            variant="outlined"
            sx={buttonStyles(false)}
            fullWidth
            onClick={login}
        >
            <Image src={stravaButton} height={48} alt="Log in with Strava" />
        </Button>
    );
};

export default StravaLoginButton;
