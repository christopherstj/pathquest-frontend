import LoginCard from "@/components/app/login/LoginCard";
import { Metadata } from "next";
import React from "react";

interface Props {
    searchParams: { [key: string]: string | string[] | undefined };
}

export const metadata: Metadata = {
    title: "PathQuest | Login",
};

const page = ({ searchParams }: Props) => {
    const redirectUrl = searchParams.redirect as string | undefined;

    // redirectLogin(redirectUrl);

    return (
        <div className="h-screen w-full flex flex-col items-center justify-center">
            <LoginCard redirectUrl={redirectUrl} />
        </div>
    );
};

export default page;
