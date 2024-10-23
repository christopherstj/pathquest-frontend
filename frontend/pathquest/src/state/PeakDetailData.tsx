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

    const isSummitted = details.peak?.isSummitted ?? false;

    return isSummitted ? (
        <PeakDetailProvider {...details}>{children}</PeakDetailProvider>
    ) : (
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
                    Looks like you don't have any data for {details.peak?.Name}{" "}
                    yet!{" "}
                </Typography>
                <Button
                    sx={{
                        borderRadius: "12px",
                        backgroundColor: "primary.container",
                        color: "primary.onContainer",
                    }}
                    color="primary"
                    LinkComponent={Link}
                    href="/app/peaks"
                >
                    Go Back and Get Out There!
                </Button>
            </Grid>
        </GridContainer>
    );
};

export default PeakDetailData;
