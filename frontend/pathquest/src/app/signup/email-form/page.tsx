import { useAuth } from "@/auth/useAuth";
import { redirect } from "next/navigation";
import React from "react";
import Image from "next/image";
import EmailForm from "@/components/app/login/EmailForm";
import logo from "../../../public/images/logo-no-background.svg";

type Props = {
    searchParams: { [key: string]: string | string[] | undefined };
};

const page = ({ searchParams }: Props) => {
    const redirectUrl = searchParams.redirect as string | undefined;

    return (
        <div className="h-screen w-full flex flex-col items-center justify-center">
            <div className="bg-primary-dim rounded-md shadow-md shadow-primary-foreground p-6 flex flex-col items-center gap-4 max-w-sm">
                <Image src={logo} alt="PathQuest logo" width={300} />
                <h1 className="text-5xl font-bold">PathQuest</h1>
                <h3 className="text-md text-center text-primary-foreground">
                    One more step! Complete your signup to start your adventure.
                </h3>
                <EmailForm redirectUrl={redirectUrl} />
            </div>
        </div>
    );
};

export default page;
