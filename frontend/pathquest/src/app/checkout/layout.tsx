import getUser from "@/actions/getUser";
import GridContainer from "@/components/common/GridContainer";
import { Grid2 as Grid } from "@mui/material";
import { redirect } from "next/navigation";
import React from "react";

const layout = async ({ children }: { children: React.ReactNode }) => {
    const { userFound, user, error } = await getUser();

    if (
        !userFound ||
        error ||
        !user ||
        user.isSubscribed ||
        user.isLifetimeFree
    ) {
        redirect("/app");
    }

    return (
        <GridContainer spacing={1}>
            <Grid
                size={{ xs: 12 }}
                display="flex"
                justifyContent="center"
                alignItems="center"
            >
                {children}
            </Grid>
        </GridContainer>
    );
};

export default layout;
