"use client";
import { Button } from "@/components/ui/button";
import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import React from "react";

const UserButton = () => {
    const { data: session } = useSession();

    const pathname = usePathname();
    const searchParams = useSearchParams();

    const queryString = searchParams.toString();

    const redirectPath = `${pathname}${queryString ? `?${queryString}` : ""}`;

    const name = session?.user?.name;

    const logout = async () => {
        await signOut();
    };

    console.log(session);

    if (!session) {
        const redirectTo = encodeURIComponent(redirectPath || "/");
        return (
            <Button
                asChild
                className="rounded-md bg-accent hover:bg-accent/80 text-white"
            >
                <Link href={`/login?redirect=${redirectTo}`}>Login</Link>
            </Button>
        );
    }

    return (
        <div className="flex flex-col">
            <div className="rounded-lg bg-primary-dim">
                <p className="p-2 text-primary-dim-foreground">
                    {name ?? "Unnamed"}
                </p>
            </div>
            <Button
                onClick={logout}
                className="rounded-md bg-primary hover:bg-primary/80 text-primary-foreground"
            >
                Logout
            </Button>
        </div>
    );
};

export default UserButton;
