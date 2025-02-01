import getPeakDetails from "@/actions/getPeakDetails";
import React from "react";
import PeakDetailProvider, { PeakDetailContext } from "./PeakDetailContext";
import GridContainer from "@/components/common/GridContainer";
import { Box, Button, Grid2 as Grid, Typography } from "@mui/material";
import Link from "next/link";

type Props = {
    peakId: string;
    children: React.ReactNode;
};

const PeakDetailData = async ({ peakId, children }: Props) => {
    const details = await getPeakDetails(peakId);

    if (!details.peak) {
        return (
            <GridContainer spacing={3} alignItems="center">
                <Grid
                    size={{ xs: 12 }}
                    display="flex"
                    flexDirection="column"
                    justifyContent="center"
                    alignItems="center"
                    height="100%"
                    gap="12px"
                >
                    <Typography
                        variant="h5"
                        color="primary.onContainer"
                        textAlign="center"
                    >
                        Looks like something went wrong!
                    </Typography>
                    <Button
                        variant="text"
                        color="primary"
                        LinkComponent={Link}
                        href="/app/peaks"
                    >
                        Go Back to Peaks
                    </Button>
                </Grid>
            </GridContainer>
        );
    } else {
        return (
            <PeakDetailProvider
                peak={details.peak}
                activities={details.activities}
                summits={details.summits}
            >
                {children}
            </PeakDetailProvider>
        );
    }
};

export default PeakDetailData;
