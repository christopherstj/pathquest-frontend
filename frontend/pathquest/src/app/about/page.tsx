import GridContainer from "@/components/common/GridContainer";
import { Metadata } from "next";
import { Grid2 as Grid } from "@mui/material";
import React from "react";
import Header from "@/components/landing/Header";
import Title from "@/components/about/Title";

const page = () => {
    return (
        <GridContainer flexDirection="row-reverse">
            <Grid size={{ xs: 12, md: 6 }}>
                <Header />
            </Grid>
            <Grid
                size={{ xs: 12, md: 5 }}
                offset={{
                    md: 1,
                }}
            >
                <Title />
            </Grid>
        </GridContainer>
    );
};

export default page;
