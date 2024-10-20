import GridContainer from "@/components/common/GridContainer";
import { Grid2 as Grid } from "@mui/material";
import React from "react";

const page = () => {
    return (
        <GridContainer flexDirection="row-reverse" spacing={3}>
            <Grid size={{ xs: 12, md: 6, lg: 8 }}></Grid>
            <Grid size={{ xs: 12, md: 6, lg: 4 }}></Grid>
        </GridContainer>
    );
};

export default page;
