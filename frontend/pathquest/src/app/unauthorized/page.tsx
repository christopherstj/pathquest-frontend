import GridContainer from "@/components/common/GridContainer";
import React from "react";
import { Grid2 as Grid } from "@mui/material";
import NotAuthorized from "@/components/auth/NotAuthorized";

const page = () => {
    return (
        <GridContainer spacing={3}>
            <Grid
                size={{ xs: 12 }}
                display="flex"
                justifyContent="center"
                alignItems="center"
            >
                <NotAuthorized />
            </Grid>
        </GridContainer>
    );
};

export default page;
