import GridContainer from "@/components/common/GridContainer";
import React from "react";
import {
    Box,
    Grid2 as Grid,
    LinearProgress,
    Skeleton,
    SxProps,
    Typography,
} from "@mui/material";

const skeletonStyles: SxProps = {
    borderRadius: "24px",
    borderColor: "primary.onContainer",
    width: "100%",
    height: "100%",
};

const loading = () => {
    return (
        <GridContainer spacing={3}>
            <Grid
                size={{ xs: 12 }}
                display="flex"
                justifyContent="center"
                alignItems="center"
            >
                <Box
                    display="flex"
                    flexDirection="column"
                    alignItems="center"
                    maxWidth="500px"
                    width="100%"
                    gap="12px"
                >
                    <Typography variant="h4" color="primary.onContainer">
                        Fetching data...
                    </Typography>
                    <LinearProgress color="secondary" sx={{ width: "100%" }} />
                </Box>
            </Grid>
        </GridContainer>
    );
};

export default loading;
