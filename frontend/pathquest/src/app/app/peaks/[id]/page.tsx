import getPeakDetails from "@/actions/getPeakDetails";
import GridContainer from "@/components/common/GridContainer";
import React from "react";
import { Grid2 as Grid } from "@mui/material";
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
                <Grid size={{ xs: 12, md: 7, lg: 8, xl: 9 }}>
                    <PeakDetailMap />
                </Grid>
                <Grid size={{ xs: 12, md: 5, lg: 4, xl: 3 }}>
                    <ActivityList />
                </Grid>
            </GridContainer>
        </PeakDetailData>
    );
};

export default page;
