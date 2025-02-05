"use client";
import { useMessage } from "@/state/MessageContext";
import { useUser } from "@/state/UserContext";
import { Box, Divider, List, SxProps, Typography } from "@mui/material";
import React from "react";
import UnclimbedPeakRow from "./UnclimbedPeakRow";
import ChallengeRow from "../challenges/ChallengeRow";
import { useDashboard } from "@/state/DashboardContext";

const containerStyles: SxProps = {
    borderRadius: "12px",
    backgroundColor: "secondary.container",
    padding: "8px 4px 0px 4px",
    boxShadow: 3,
    display: "flex",
    flexDirection: "column",
    width: "100%",
    height: {
        xs: "70vh",
        md: "calc(60vh - 66px)",
    },
};

const listStyles: SxProps = {
    padding: 0,
    paddingRight: "4px",
    paddingLeft: "8px",
    flex: 1,
    overflowY: "scroll",
    display: "flex",
    flexDirection: "column",
    gap: "8px",
    width: "100%",
    "&::-webkit-scrollbar": {
        width: "8px",
    },
    "&::-webkit-scrollbar-thumb": {
        backgroundColor: "secondary.onContainer",
        borderRadius: "8px",
    },
    "&::-webkit-scrollbar-thumb:hover": {
        backgroundColor: "secondary.onContainerDim",
    },
    "&::-webkit-scrollbar-track": {
        backgroundColor: "transparent",
    },
};

const IncompleteChallenges = () => {
    const [{ incompleteChallenges }] = useDashboard();

    return (
        <>
            <Box width="100%">
                <Typography variant="h4" color="primary.onContainer">
                    Ongoing Challenges
                </Typography>
                <Divider
                    sx={{
                        backgroundColor: "primary.onContainer",
                        height: "2px",
                        marginTop: "12px",
                    }}
                />
            </Box>
            <Box sx={containerStyles}>
                {incompleteChallenges && incompleteChallenges.length > 0 ? (
                    <Box sx={listStyles}>
                        {incompleteChallenges
                            .sort(
                                (a, b) =>
                                    (a.total - a.completed) / a.total -
                                    (b.total - b.completed) / b.total
                            )
                            .map((challenge) => (
                                <ChallengeRow
                                    challenge={challenge}
                                    key={challenge.id}
                                />
                            ))}
                    </Box>
                ) : (
                    <Typography
                        variant="body1"
                        color="secondary.onContainerDim"
                        textAlign="center"
                    >
                        Looks like something went wrong. Please try again later.
                    </Typography>
                )}
            </Box>
        </>
    );
};

export default IncompleteChallenges;
