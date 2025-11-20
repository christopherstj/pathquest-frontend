import React from "react";
import Image from "next/image";
import logo from "../../../public/images/logo-no-background.svg";
import StravaLoginButton from "./StravaLoginButton";

type Props = {
    redirectUrl?: string;
};

const LoginCard = ({ redirectUrl }: Props) => {
    return (
        <div className="bg-primary-dim rounded-md shadow-md shadow-primary-foreground p-6 flex flex-col items-center gap-4 max-w-sm">
            <Image src={logo} alt="PathQuest logo" width={300} />
            <h1 className="text-5xl font-bold">PathQuest</h1>
            <h3 className="text-md text-center text-primary-foreground">
                Adventure awaits! Sign up to start your journey.
            </h3>
            <StravaLoginButton redirectUrl={redirectUrl} />
            <p className="text-sm text-center text-primary-foreground-dim">
                When you sign up, we will start processing all of your
                historical Strava data. This may take some time depending on how
                much data you have.
            </p>
        </div>
    );
};

export default LoginCard;
