import React from "react";
import { Grid2 as Grid, Grid2Props } from "@mui/material";

const GridContainer = ({ children, ...props }: Grid2Props) => {
    return (
        <Grid container spacing={3} minHeight="100%" {...props}>
            {children}
        </Grid>
    );
};

export default GridContainer;
