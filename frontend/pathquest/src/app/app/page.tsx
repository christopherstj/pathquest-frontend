import getUser from "@/actions/getUser";
import { redirect } from "next/navigation";
import React from "react";
import { Grid2 as Grid } from "@mui/material";
import createUser from "@/actions/createUser";
import Map from "@/components/dashboard/Map";
import IncompleteChallenges from "@/components/dashboard/IncompleteChallenges";

const page = async () => {
    const user = await getUser();

    if (!user.userFound && !user.error) {
        await createUser();
    } else if (user.error) {
        redirect("/login");
    }

    return (
        <Grid container spacing={3} minHeight="100%">
            <Map />
            <Grid
                size={{ xs: 12, lg: 4 }}
                display="flex"
                flexDirection="column"
                gap="16px"
            >
                <IncompleteChallenges />
            </Grid>
        </Grid>
    );
};

export default page;
