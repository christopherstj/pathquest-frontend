import React from "react";
import { Grid2 as Grid } from "@mui/material";
import LoginCard from "@/components/auth/LoginCard";
import { useAuth } from "@/auth/useAuth";
import { redirect } from "next/navigation";

const page = async () => {
    const session = await useAuth();

    if (session) {
        return redirect("/");
    }

    return (
        <Grid container spacing={1} minHeight="100%">
            <Grid
                size={{ xs: 12 }}
                display="flex"
                justifyContent="center"
                alignItems="center"
            >
                <LoginCard />
            </Grid>
        </Grid>
    );
};

export default page;
