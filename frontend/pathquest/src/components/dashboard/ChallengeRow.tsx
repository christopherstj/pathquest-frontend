import hexToRgb from "@/helpers/hexToRgb";
import ChallengeProgress from "@/typeDefs/ChallengeProgress";
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
    backgroundColor: "secondary.containerDim",
    position: "relative",
    width: {
        xs: "100%",
        md: "auto",
    },
    transition: "box-shadow 0.2s",
    cursor: "pointer",
    "&:hover": {
        boxShadow: `0px 3px 3px -2px rgba(${hexToRgb(
            theme.palette.secondary.base
        )}, 0.2), 0px 3px 4px 0px rgba(${hexToRgb(
            theme.palette.secondary.base
        )}, 0.14), 0px 1px 8px 0px rgba(${hexToRgb(
            theme.palette.secondary.base
        )}, 0.12);`,
    },
});

type Props = {
    challenge: ChallengeProgress;
};

const ChallengeRow = ({ challenge }: Props) => {
    const percentComplete = (challenge.completed / challenge.total) * 100;
    const color =
        percentComplete < 50
            ? "tertiary"
            : challenge.total < 80
            ? "secondary"
            : "primary";

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
                    color="secondary.onContainerDim"
                >
                    {challenge.name}
                </Typography>
                <Typography variant="caption" color="secondary.onContainerDim">
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
                    {challenge.completed} / {challenge.total}
                </Typography>
                <Typography variant="caption" color={`${color}.containerDim`}>
                    peaks
                </Typography>
            </Box>
        </ButtonBase>
    );
};

export default ChallengeRow;
