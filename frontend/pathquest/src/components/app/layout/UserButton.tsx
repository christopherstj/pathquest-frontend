"use client";
import { Button } from "@/components/ui/button";
import { useSession } from "next-auth/react";
import Link from "next/link";
import React from "react";

const UserButton = () => {
    const { data: session } = useSession();

    const name = session?.user?.name;

    if (!name) {
        return (
            <Button asChild className="rounded-md bg-accent text-white">
                <Link href="/login">Login</Link>
            </Button>
        );
    }

    return (
        <div className="rounded-lg bg-primary-dim">
            <p className="p-2 text-primary-dim-foreground">{name}</p>
        </div>
    );
};

export default UserButton;
