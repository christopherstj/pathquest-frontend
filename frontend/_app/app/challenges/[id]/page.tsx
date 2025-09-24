import GridContainer from "@/components/common/GridContainer";
import React from "react";
import { Grid2 as Grid } from "@mui/material";
import ChallengeDetailMap from "@/components/challenges/ChallengeDetailMap";
import ChallengeDetailData from "@/state_old/ChallengeDetailData";
import ChallengePeaksList from "@/components/challenges/ChallengePeaksList";
import ChallengeTitle from "@/components/challenges/ChallengeTitle";

export const maxDuration = 60;

type Props = {
    params: {
        id: string;
    };
};

const page = ({ params: { id } }: Props) => {
    return (
        <ChallengeDetailData id={id}>
            <GridContainer spacing={3}>
                <Grid size={{ xs: 12, md: 7, lg: 8 }}>
                    <ChallengeTitle />
                    <ChallengeDetailMap />
                </Grid>
                <Grid size={{ xs: 12, md: 5, lg: 4 }}>
                    <ChallengePeaksList />
                </Grid>
            </GridContainer>
        </ChallengeDetailData>
    );
};

export default page;
