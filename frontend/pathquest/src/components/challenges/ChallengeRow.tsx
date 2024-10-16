import hexToRgb from "@/helpers/hexToRgb";
import Challenge from "@/typeDefs/Challenge";
import { Box, ButtonBase, SxProps, Theme, Typography } from "@mui/material";
import Link from "next/link";
import React from "react";

const rowStyles: SxProps<Theme> = (theme) => ({
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "12px",
    padding: "8px",
    borderRadius: "12px",
    backgroundColor: "primary.containerDim",
    position: "relative",
    overflow: "hidden",
    minHeight: "54px",
    width: {
        xs: "100%",
        md: "auto",
    },
    transition: "box-shadow 0.2s",
    cursor: "pointer",
    "&:hover": {
        boxShadow: `0px 3px 3px -2px rgba(${hexToRgb(
            theme.palette.primary.base
        )}, 0.2), 0px 3px 4px 0px rgba(${hexToRgb(
            theme.palette.primary.base
        )}, 0.14), 0px 1px 8px 0px rgba(${hexToRgb(
            theme.palette.primary.base
        )}, 0.12);`,
    },
});

type Props = {
    challenge: Challenge;
};

const ChallengeRow = ({ challenge }: Props) => {
    const color =
        challenge.numPeaks < 5
            ? "primary"
            : challenge.numPeaks < 20
            ? "secondary"
            : "tertiary";

    return (
        <ButtonBase
            sx={rowStyles}
            LinkComponent={Link}
            href={`/app/peaks/${challenge.id}`}
        >
            <Box
                display="flex"
                flexDirection="column"
                justifyContent="space-between"
                height="100%"
            >
                <Typography
                    variant="body1"
                    fontWeight="bold"
                    color="primary.onContainerDim"
                >
                    {challenge.name}
                </Typography>
                <Typography variant="caption" color="primary.onContainerDim">
                    {challenge.region}
                </Typography>
            </Box>
            <Box
                sx={{
                    backgroundColor: `${color}.onContainerDim`,
                    padding: "8px",
                    borderRadius: "8px",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                }}
            >
                <Typography
                    variant="h6"
                    color={`${color}.container`}
                    fontWeight="bold"
                >
                    {challenge.numPeaks}
                </Typography>
                <Typography variant="caption" color={`${color}.containerDim`}>
                    peaks
                </Typography>
            </Box>
        </ButtonBase>
    );
};

export default ChallengeRow;
