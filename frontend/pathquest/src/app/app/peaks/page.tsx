import GridContainer from "@/components/common/GridContainer";
import DashboardPeaksMap from "@/components/peaks/DashboardPeaksMap";
import PeakSelectionButtons from "@/components/peaks/PeakSelectionButtons";
import PeaksList from "@/components/peaks/PeaksList";
import PeaksMapProvider from "@/state/PeaksMapContext";
import { Grid2 as Grid } from "@mui/material";
import React from "react";

const page = async () => {
    return (
        <PeaksMapProvider>
            <GridContainer flexDirection="row-reverse" spacing={3}>
                <Grid size={{ xs: 12, md: 6, lg: 8, xl: 9 }}>
                    <DashboardPeaksMap />
                </Grid>
                <Grid
                    size={{ xs: 12, md: 6, lg: 4, xl: 3 }}
                    display="flex"
                    flexDirection="column"
                    gap="12px"
                >
                    <PeakSelectionButtons />
                    <PeaksList />
                </Grid>
            </GridContainer>
        </PeaksMapProvider>
    );
};

export default page;
