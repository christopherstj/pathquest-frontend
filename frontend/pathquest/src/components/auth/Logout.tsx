"use client";
import { Typography } from "@mui/material";
import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import React from "react";

const Logout = () => {
    const { data } = useSession();

    const router = useRouter();

    if (!data) {
        router.push("/login");
    }

    const logout = async () => {
        await signOut({
            redirect: true,
            callbackUrl: "/login",
        });
    };

    React.useEffect(() => {
        logout();
    }, []);

    return (
        <Typography variant="h6" color="primary.onContainer">
            Logging out...
        </Typography>
    );
};

export default Logout;
