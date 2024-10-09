"use client";
import React from "react";
import { Button, Grid2 as Grid, Typography } from "@mui/material";
import { signIn, signOut, useSession } from "next-auth/react";

const Page = () => {
    const { data } = useSession();

    const [response, setResponse] = React.useState<object | null>(null);

    const login = async () => {
        const res = await signIn("strava");
    };

    const logout = async () => {
        const res = await signOut();
    };

    const test = async () => {
        const res = await fetch("/api/test", {
            method: "GET",
        });
        setResponse(await res.json());
    };

    return (
        <Grid container spacing={3}>
            <Grid size={{ xs: 12 }}>
                {data ? (
                    <>
                        <Typography color="primary">
                            You're signed in already: {data.user?.name}
                        </Typography>
                        <Button color="primary" onClick={logout}>
                            Logout
                        </Button>
                    </>
                ) : (
                    <Button color="primary" onClick={login}>
                        Login With Strava
                    </Button>
                )}
                <Button color="primary" onClick={test}>
                    Test
                </Button>
                {response && (
                    <pre style={{ color: "black" }}>
                        {JSON.stringify(response, null, 2)}
                    </pre>
                )}
            </Grid>
        </Grid>
    );
};

export default Page;
