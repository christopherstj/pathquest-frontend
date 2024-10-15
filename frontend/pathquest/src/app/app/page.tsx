import getUser from "@/actions/getUser";
import { redirect } from "next/navigation";
import React from "react";
import { Grid2 as Grid, Typography } from "@mui/material";
import createUser from "@/actions/createUser";

const page = async () => {
    const user = await getUser();

    if (!user.userFound && !user.error) {
        await createUser();
    } else if (user.error) {
        redirect("/login");
    }

    return (
        <Grid container spacing={1} minHeight="100%">
            <Grid
                size={{ xs: 12 }}
                display="flex"
                justifyContent="center"
                alignItems="center"
            >
                <Typography variant="h6" color="primary.onContainer">
                    {user.user ? `Welcome ${user.user.name}` : "Loading..."}
                </Typography>
            </Grid>
        </Grid>
    );
};

export default page;
