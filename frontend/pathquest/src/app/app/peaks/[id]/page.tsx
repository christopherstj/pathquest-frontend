import getPeakDetails from "@/actions/getPeakDetails";
import GridContainer from "@/components/common/GridContainer";
import React from "react";
import { Divider, Grid2 as Grid, Typography } from "@mui/material";
import PeakDetailMap from "@/components/peaks/PeakDetailMap";
import PeakDetailData from "@/state/PeakDetailData";
import ActivityList from "@/components/peaks/ActivityList";

type Props = {
    params: {
        id: string;
    };
};

const page = ({ params: { id } }: Props) => {
    return (
        <PeakDetailData peakId={id}>
            <GridContainer spacing={3}>
                <Grid size={{ xs: 12, md: 7, lg: 8 }}>
                    <PeakDetailMap />
                </Grid>
                <Grid size={{ xs: 12, md: 5, lg: 4 }}>
                    <ActivityList />
                </Grid>
            </GridContainer>
        </PeakDetailData>
    );
};

export default page;
