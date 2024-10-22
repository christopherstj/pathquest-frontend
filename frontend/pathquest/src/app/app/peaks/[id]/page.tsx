import getPeakDetails from "@/actions/getPeakDetails";
import GridContainer from "@/components/common/GridContainer";
import React from "react";
import { Grid2 as Grid } from "@mui/material";
import PeakDetailMap from "@/components/peaks/PeakDetailMap";

type Props = {
    params: {
        id: string;
    };
};

const page = async (props: Props) => {
    const details = await getPeakDetails(props.params.id);

    return (
        <GridContainer spacing={3}>
            <Grid size={{ xs: 12 }}>
                <PeakDetailMap details={details} />
            </Grid>
        </GridContainer>
    );
};

export default page;
