import getChallengeDetails from "@/actions/getChallengeDetails";
import GridContainer from "@/components/common/GridContainer";
import React from "react";
import { Grid2 as Grid } from "@mui/material";
import ChallengeDetailProvider from "@/state/ChallengeDetailContext";
import ChallengeDetailMap from "@/components/challenges/ChallengeDetailMap";

export const maxDuration = 60;

type Props = {
    params: {
        id: string;
    };
};

const page = async ({ params: { id } }: Props) => {
    const data = await getChallengeDetails(id);

    if (!data) {
        return null;
    }

    return (
        <ChallengeDetailProvider data={data}>
            <GridContainer spacing={3}>
                <Grid size={{ xs: 12, md: 7, lg: 8, xl: 9 }}>
                    <ChallengeDetailMap />
                </Grid>
                <Grid size={{ xs: 12, md: 5, lg: 4, xl: 3 }}></Grid>
            </GridContainer>
        </ChallengeDetailProvider>
    );
};

export default page;
