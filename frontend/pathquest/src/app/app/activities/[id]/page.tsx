import getActivityDetails from "@/actions/getActivityDetails";
import GridContainer from "@/components/common/GridContainer";
import ActivityDetailData from "@/state/ActivityDetailData";
import React from "react";
import { Box, Divider, Grid2 as Grid, Typography } from "@mui/material";
import ActivityDetailMap from "@/components/activities/ActivityDetailMap";
import ActivityPeaksList from "@/components/activities/ActivityPeaksList";
import ActivityDetails from "@/components/activities/ActivityDetails";
import ActivityTitle from "@/components/activities/ActivityTitle";

type Props = {
    params: {
        id: string;
    };
};

const page = ({ params: { id } }: Props) => {
    return (
        <ActivityDetailData id={id}>
            <GridContainer spacing={3}>
                <Grid size={{ xs: 12, md: 7, lg: 8 }} position="relative">
                    <ActivityTitle />
                    <ActivityDetailMap />
                </Grid>
                <Grid
                    size={{ xs: 12, md: 5, lg: 4 }}
                    display="flex"
                    flexDirection="column"
                    gap="12px"
                >
                    <Box>
                        <Typography variant="h4" color="primary.onContainer">
                            Summitted Peaks
                        </Typography>
                        <Divider
                            color="primary"
                            sx={{
                                margin: "12px 0px",
                            }}
                        />
                    </Box>
                    <ActivityPeaksList />
                    <ActivityDetails />
                </Grid>
            </GridContainer>
        </ActivityDetailData>
    );
};

export default page;
