import redirectLogin from "@/actions/auth/redirectLogin";
import SignupCard from "@/components/app/login/SignupCard";
import { Metadata } from "next";
import React from "react";

interface Props {
    searchParams: { [key: string]: string | string[] | undefined };
}

export const metadata: Metadata = {
    title: "PathQuest | Signup",
};

const page = ({ searchParams }: Props) => {
    const redirectUrl = searchParams.redirect as string | undefined;

    return (
        <div className="h-screen w-full flex flex-col items-center justify-center">
            <SignupCard redirectUrl={redirectUrl} />
        </div>
    );
};

export default page;
