import getActivityDetails from "@/actions/getActivityDetails";
import GridContainer from "@/components/common/GridContainer";
import ActivityDetailData from "@/state/ActivityDetailData";
import React from "react";
import { Divider, Grid2 as Grid, Typography } from "@mui/material";
import ActivityDetailMap from "@/components/activities/ActivityDetailMap";
import ActivityPeaksList from "@/components/activities/ActivityPeaksList";

type Props = {
    params: {
        id: string;
    };
};

const page = ({ params: { id } }: Props) => {
    return (
        <ActivityDetailData id={id}>
            <GridContainer spacing={3}>
                <Grid size={{ xs: 12, md: 7, lg: 8 }}>
                    <ActivityDetailMap />
                </Grid>
                <Grid size={{ xs: 12, md: 5, lg: 4 }}>
                    <Typography variant="h4" color="primary.onContainer">
                        Summitted Peaks
                    </Typography>
                    <Divider
                        sx={{
                            backgroundColor: "primary.onContainer",
                            height: "2px",
                            margin: "12px 0px",
                        }}
                    />
                    <ActivityPeaksList />
                </Grid>
            </GridContainer>
        </ActivityDetailData>
    );
};

export default page;
