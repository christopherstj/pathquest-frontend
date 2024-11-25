import GridContainer from "@/components/common/GridContainer";
import { Grid2 as Grid } from "@mui/material";
import ActivitiesProvider from "@/state/ActivitiesContext";
import React from "react";
import ActivitiesMap from "@/components/activities/ActivitiesMap";
import ActivitiesList from "@/components/activities/ActivitiesList";
import ActivitiesLayout from "@/components/activities/ActivitiesLayout";

const page = () => {
    return (
        <ActivitiesProvider>
            <GridContainer flexDirection="row-reverse" spacing={3}>
                <Grid size={{ xs: 12, md: 8, lg: 9 }}>
                    <ActivitiesMap />
                </Grid>
                <Grid
                    size={{ xs: 12, md: 4, lg: 3 }}
                    display="flex"
                    flexDirection="column"
                    gap="12px"
                >
                    <ActivitiesLayout />
                </Grid>
            </GridContainer>
        </ActivitiesProvider>
    );
};

export default page;
