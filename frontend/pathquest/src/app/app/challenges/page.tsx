import getAllChallenges from "@/actions/getAllChallenges";
import GridContainer from "@/components/common/GridContainer";
import ChallengeDashboardProvider from "@/state/ChallengeDashboardContext";
import React from "react";
import { Grid2 as Grid } from "@mui/material";
import ChallengeDashboardMap from "@/components/challenges/ChallengeDashboardMap";
import ChallengeLayout from "@/components/challenges/ChallengeLayout";

const page = () => {
    return (
        <ChallengeDashboardProvider>
            <GridContainer flexDirection="row-reverse" spacing={3}>
                <Grid size={{ xs: 12, md: 6, lg: 8, xl: 9 }}>
                    <ChallengeDashboardMap />
                </Grid>
                <Grid
                    size={{ xs: 12, md: 6, lg: 4, xl: 3 }}
                    display="flex"
                    flexDirection="column"
                    gap="12px"
                >
                    <ChallengeLayout />
                </Grid>
            </GridContainer>
        </ChallengeDashboardProvider>
    );
};

export default page;
