"use client";
import { signIn, signOut, useSession } from "next-auth/react";
import React from "react";
import Image from "next/image";
import stravaButton from "@/public/images/btn_strava_connectwith_light.svg";
import { Button } from "@/components/ui/button";

type Props = {
    redirectUrl?: string;
};

const StravaLoginButton = ({ redirectUrl }: Props) => {
    const login = async () => {
        const res = await signIn("strava", {
            redirect: true,
            callbackUrl: `/signup/email-form${
                redirectUrl
                    ? `?redirectUrl=${encodeURIComponent(redirectUrl)}`
                    : ""
            }`,
        });
    };

    return (
        <Button onClick={login} className="rounded-md bg-white px-4 py-6">
            <Image src={stravaButton} height={48} alt="Log in with Strava" />
        </Button>
    );
};

export default StravaLoginButton;
