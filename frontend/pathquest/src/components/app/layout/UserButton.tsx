"use client";
import { Button } from "@/components/ui/button";
import { signIn, signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import React from "react";

const UserButton = () => {
    const { data: session } = useSession();

    const pathname = usePathname();
    const searchParams = useSearchParams();

    const queryString = searchParams.toString();

    const redirectPath = `${pathname}${queryString ? `?${queryString}` : ""}`;

    const name = session?.user?.name;

    console.log(session);

    const login = async () => {
        const res = await signIn("strava", {
            redirect: false,
        });

        // if (!res?.ok) {
        //     router.push(`/signup?redirect=${encodeURIComponent(redirectPath)}`);
        // }
    };

    const logout = async () => {
        await signOut();
    };

    if (!session) {
        const redirectTo = encodeURIComponent(redirectPath || "/");
        return (
            <div className="flex flex-col gap-1">
                <Button
                    asChild
                    className="rounded-md bg-accent hover:bg-accent/80 text-white"
                >
                    <Link href={`/signup?redirect=${redirectTo}`}>Signup</Link>
                </Button>
                <Button
                    // asChild
                    className="rounded-md bg-primary hover:bg-primary-foreground-dim/20 text-white"
                    size="sm"
                    onClick={login}
                >
                    Login
                    {/* <Link href={`/login?redirect=${redirectTo}`}>Login</Link> */}
                </Button>
            </div>
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
