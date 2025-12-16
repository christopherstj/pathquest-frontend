"use client";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { signIn, signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { User, LogOut, ChevronDown } from "lucide-react";
import React from "react";

const UserButton = () => {
    const { data: session } = useSession();

    const pathname = usePathname();
    const searchParams = useSearchParams();

    const queryString = searchParams.toString();

    const redirectPath = `${pathname}${queryString ? `?${queryString}` : ""}`;

    const name = session?.user?.name;
    const userId = session?.user?.id;
    const pic = session?.user?.image;

    const login = async () => {
        await signIn("strava", {
            redirect: false,
        });
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
                    className="rounded-md bg-primary hover:bg-primary-foreground-dim/20 text-white"
                    size="sm"
                    onClick={login}
                >
                    Login
                </Button>
            </div>
        );
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 rounded-lg bg-card/80 hover:bg-card border border-border px-3 py-2 transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20">
                    {pic ? (
                        <img
                            src={pic}
                            alt={name || "User"}
                            className="w-7 h-7 rounded-full border border-border"
                        />
                    ) : (
                        <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center">
                            <User className="w-4 h-4 text-muted-foreground" />
                        </div>
                    )}
                    <span className="text-sm font-medium text-foreground max-w-[100px] truncate hidden sm:block">
                        {name ?? "User"}
                    </span>
                    <ChevronDown className="w-4 h-4 text-muted-foreground" />
                </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem asChild>
                    <Link href={`/users/${userId}`} className="flex items-center gap-2 cursor-pointer">
                        <User className="w-4 h-4" />
                        <span>Profile</span>
                    </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                    onClick={logout}
                    className="flex items-center gap-2 cursor-pointer text-red-500 focus:text-red-500 focus:bg-red-500/10"
                >
                    <LogOut className="w-4 h-4" />
                    <span>Logout</span>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
};

export default UserButton;
