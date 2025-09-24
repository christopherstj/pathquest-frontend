import getActivityDetails from "@/actions/activities/getActivityDetails";
import GridContainer from "@/components/common/GridContainer";
import ActivityDetailData from "@/state_old/ActivityDetailData";
import React from "react";
import {
    Box,
    Divider,
    Grid2 as Grid,
    Skeleton,
    Typography,
} from "@mui/material";
import ActivityDetailMap from "@/components/activities/ActivityDetailMap";
import ActivityPeaksList from "@/components/activities/ActivityPeaksList";
import ActivityDetails from "@/components/activities/ActivityDetails";
import ActivityTitle from "@/components/activities/ActivityTitle";
// import ActivityProfileChart from "@/components/activities/ActivityProfileChart";
import dynamic from "next/dynamic";

const ActivityProfileChart = dynamic(
    () => import("@/components/activities/ActivityProfileChart"),
    {
        loading: () => <Skeleton sx={{ height: "100%", width: "100%" }} />,
    }
);

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
                    <Box
                        sx={{
                            width: "100%",
                            height: "calc(25vh - 12px)",
                            mt: "12px",
                            backgroundColor: "secondary.container",
                            borderRadius: "12px",
                            position: "relative",
                            padding: "12px",
                        }}
                    >
                        <ActivityProfileChart />
                    </Box>
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
                    </Box>
                    <ActivityPeaksList />
                    <ActivityDetails />
                </Grid>
            </GridContainer>
        </ActivityDetailData>
    );
};

export default page;
