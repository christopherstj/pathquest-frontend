import React from "react";
import { Grid2 as Grid } from "@mui/material";
import Logout from "@/components/auth/Logout";

const page = () => {
    return (
        <Grid container spacing={1} minHeight="100%">
            <Grid
                size={{ xs: 12 }}
                display="flex"
                justifyContent="center"
                alignItems="center"
            >
                <Logout />
            </Grid>
        </Grid>
    );
};

export default page;
