import GridContainer from "@/components/common/GridContainer";
import { Metadata } from "next";
import { Box, Button, Grid2 as Grid, SxProps, Typography } from "@mui/material";
import React from "react";
import Header from "@/components/landing/Header";
import Title from "@/components/about/Title";
import Link from "next/link";

export const metadata: Metadata = {
    title: "About | PathQuest",
    description: "Learn more about PathQuest and what it can do for you.",
};

const primaryCardStyles: SxProps = {
    backgroundColor: "primary.container",
    borderRadius: "12px",
    padding: "12px",
    display: "flex",
    flexDirection: "column",
    gap: "12px",
    margin: "0 auto",
    maxWidth: "400px",
    height: "100%",
    ".MuiButton-root": {
        borderColor: "primary.onContainer",
        color: "primary.onContainer",
        borderRadius: "24px",
        alignSelf: "flex-end",
        marginTop: "auto",
    },
};

const secondaryCardStyles: SxProps = {
    backgroundColor: "secondary.container",
    borderRadius: "12px",
    padding: "12px",
    display: "flex",
    flexDirection: "column",
    gap: "12px",
    margin: "0 auto",
    maxWidth: "400px",
    height: "100%",
    ".MuiButton-root": {
        borderColor: "secondary.onContainer",
        color: "secondary.onContainer",
        borderRadius: "24px",
        alignSelf: "flex-end",
        marginTop: "auto",
    },
};

const page = () => {
    return (
        <>
            <Grid
                container
                spacing={3}
                flexDirection="row-reverse"
                sx={{
                    mb: {
                        xs: 0,
                        md: 3,
                    },
                }}
            >
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
            </Grid>
            <Grid container spacing={3} justifyContent="center">
                <Grid size={{ xs: 12, md: 6, lg: 4 }}>
                    <Box sx={primaryCardStyles}>
                        <Typography
                            variant="h4"
                            component="h3"
                            color="primary.onContainer"
                            fontWeight="bold"
                            gutterBottom
                        >
                            What is PathQuest?
                        </Typography>
                        <Typography
                            variant="body2"
                            component="h4"
                            color="primary.onContainerDim"
                        >
                            PathQuest is a platform that tells you what summits
                            you've climbed, when, how many times, and what
                            summits you have yet to climb. Set your own goals,
                            or take a look at our catalog of challenges to find
                            you next advewnture!
                        </Typography>
                        <Button
                            LinkComponent={Link}
                            href="/app"
                            variant="outlined"
                        >
                            Get Started
                        </Button>
                    </Box>
                </Grid>
                <Grid size={{ xs: 12, md: 6, lg: 4 }}>
                    <Box sx={secondaryCardStyles}>
                        <Typography
                            variant="h4"
                            component="h3"
                            color="secondary.onContainer"
                            fontWeight="bold"
                            gutterBottom
                        >
                            How does it work?
                        </Typography>
                        <Typography
                            variant="body2"
                            component="h4"
                            color="secondary.onContainerDim"
                        >
                            PathQuest connects your Strava data (for now, only
                            Strava, but we're planning to expand to other
                            platforms) to our platform. We then analyze your
                            data to determine which summits you've climbed, and
                            how many times, during your entire history on
                            Strava. We keep adding to this tally as you continue
                            to hike, run, ride, climb, or whatever else you want
                            to do!
                        </Typography>
                        <Button
                            LinkComponent={Link}
                            href="/app/peaks"
                            variant="outlined"
                        >
                            Check Out My Summits
                        </Button>
                    </Box>
                </Grid>
                <Grid size={{ xs: 12, md: 6, lg: 4 }}>
                    <Box sx={primaryCardStyles}>
                        <Typography
                            variant="h4"
                            component="h3"
                            color="primary.onContainer"
                            fontWeight="bold"
                            gutterBottom
                        >
                            What are challenges?
                        </Typography>
                        <Typography
                            variant="body2"
                            component="h4"
                            color="primary.onContainerDim"
                        >
                            PathQuest offers you the ability to take challenges,
                            in your local area or across countries, summer or
                            winter, easy or hard. We have challenges for
                            everyone, from the casual hiker to the seasoned
                            mountaineer. As you continue doing your thing, we'll
                            let you know what challenges you're already in the
                            process of achieving, or you can set your own
                            specific goals and get after it!
                        </Typography>
                        <Button
                            LinkComponent={Link}
                            href="/app/challenges"
                            variant="outlined"
                        >
                            Check Out Challenges
                        </Button>
                    </Box>
                </Grid>
            </Grid>
        </>
    );
};

export default page;
