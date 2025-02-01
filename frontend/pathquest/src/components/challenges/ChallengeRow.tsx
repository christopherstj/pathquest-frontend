import hexToRgb from "@/helpers/hexToRgb";
import Challenge from "@/typeDefs/Challenge";
import ChallengeProgress from "@/typeDefs/ChallengeProgress";
import {
    Box,
    Button,
    ButtonBase,
    SxProps,
    Theme,
    Typography,
} from "@mui/material";
import Link from "next/link";
import React from "react";
import ChallengeCompletionBar from "./ChallengeCompletionBar";

const rowStyles =
    (isVirtualized: boolean): SxProps<Theme> =>
    (theme) => ({
        display: "flex",
        justifyContent: "space-between",
        alignItems: "stretch",
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
        ...(isVirtualized && {
            mb: "8px",
        }),
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

const buttonStyles: SxProps = {
    borderRadius: "24px",
    backgroundColor: "transparent",
    borderColor: "primary.onContainer",
    color: "primary.onContainer",
    "&:hover": {
        backgroundColor: "primary.containerDim",
    },
};

type Props = {
    challenge: Challenge | ChallengeProgress;
    onClick?: (lat: number | undefined, long: number | undefined) => void;
    isVirtualized?: boolean;
};

const ChallengeRow = ({ challenge, onClick, isVirtualized = false }: Props) => {
    const getColor = () => {
        if ("total" in challenge) {
            const percentComplete =
                (challenge.completed / challenge.total) * 100;
            return percentComplete === 0
                ? "secondary"
                : percentComplete < 100
                ? "tertiary"
                : "primary";
        } else {
            return challenge.numPeaks < 5
                ? "primary"
                : challenge.numPeaks < 20
                ? "secondary"
                : "tertiary";
        }
    };

    const color = getColor();

    const peaksDisplay =
        "total" in challenge ? (
            <Typography
                variant="h6"
                color={`${color}.container`}
                fontWeight="bold"
            >
                {challenge.completed} / {challenge.total}
            </Typography>
        ) : (
            <Typography
                variant="h6"
                color={`${color}.container`}
                fontWeight="bold"
            >
                {challenge.numPeaks}
            </Typography>
        );

    return (
        <ButtonBase
            sx={rowStyles(isVirtualized)}
            LinkComponent={Link}
            href={`/app/challenges/${challenge.id}`}
        >
            <Box
                display="flex"
                flexDirection="column"
                flex="1"
                paddingLeft="8px"
            >
                <Typography
                    variant="body1"
                    fontSize="1.25rem"
                    fontWeight="bold"
                    color="primary.onContainerDim"
                >
                    {challenge.name}
                </Typography>
                <Typography variant="caption" color="primary.onContainerDim">
                    {challenge.region}
                </Typography>
                {"total" in challenge && (
                    <Box
                        height="12px"
                        width="100%"
                        marginTop="auto"
                        marginBottom="8px"
                        paddingRight="8px"
                    >
                        <ChallengeCompletionBar
                            total={challenge.total}
                            completed={challenge.completed}
                        />
                    </Box>
                )}
            </Box>
            <Box
                display="flex"
                flexDirection="column"
                justifyContent="space-between"
                height="100%"
                gap="4px"
            >
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
                    {peaksDisplay}
                    <Typography
                        variant="caption"
                        color={`${color}.containerDim`}
                    >
                        peaks
                    </Typography>
                </Box>
                {onClick && (
                    <Button
                        sx={buttonStyles}
                        size="small"
                        color="primary"
                        variant="text"
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            onClick(challenge.centerLat, challenge.centerLong);
                        }}
                    >
                        Fly to challenge
                    </Button>
                )}
            </Box>
        </ButtonBase>
    );
};

export default ChallengeRow;
