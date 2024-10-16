import getPeaks from "@/actions/getPeaks";
import GridContainer from "@/components/common/GridContainer";
import { Metadata } from "next";
import React from "react";
import { Grid2 as Grid, SxProps, Typography } from "@mui/material";
import PeaksSearch from "@/components/peaks/PeaksSearch";

const titleContainerStyles: SxProps = {
    display: "flex",
    flexDirection: "column",
    alignItems: {
        xs: "center",
        md: "flex-end",
    },
    justifyContent: "center",
    gap: "8px",
    // width: "100%",
    height: {
        xs: "30vh",
        md: "auto",
    },
};

const searchContainerStyles: SxProps = {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    // alignItems: "center",
};

const textStyles: SxProps = {
    textAlign: {
        xs: "center",
        md: "right",
    },
};

export const metadata: Metadata = {
    title: "Peaks | PathQuest",
    description: "View our catalog of peaks and choose your next adventure.",
};

const page = async () => {
    const peaks = await getPeaks(1, 100);

    return (
        <GridContainer
            sx={{
                flexDirection: {
                    xs: "column",
                    md: "row",
                },
            }}
        >
            <Grid
                size={{ md: 5, lg: 4, xl: 3 }}
                offset={{
                    lg: 1,
                    xl: 2,
                }}
                sx={titleContainerStyles}
            >
                <Typography
                    variant="h2"
                    component="h1"
                    color="primary.onContainer"
                    sx={textStyles}
                >
                    Find your next summit
                </Typography>
            </Grid>
            <Grid
                size={{
                    md: 6,
                }}
                offset={{
                    md: 1,
                    lg: 1,
                    xl: 1,
                }}
                sx={searchContainerStyles}
            >
                <PeaksSearch initialPeaks={peaks} />
            </Grid>
        </GridContainer>
    );
};

export default page;
