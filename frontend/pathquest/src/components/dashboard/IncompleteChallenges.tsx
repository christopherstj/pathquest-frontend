"use client";
import { useMessage } from "@/state/MessageContext";
import { useUser } from "@/state/UserContext";
import { Box, Button, Divider, List, SxProps, Typography } from "@mui/material";
import React from "react";
import UnclimbedPeakRow from "./UnclimbedPeakRow";
import ChallengeRow from "../challenges/ChallengeRow";
import { useDashboard } from "@/state/DashboardContext";
import Link from "next/link";

const containerStyles: SxProps = {
    borderRadius: "12px",
    backgroundColor: "secondary.container",
    padding: "8px 4px 0px 4px",
    boxShadow: 3,
    display: "flex",
    flexDirection: "column",
    width: "100%",
    alignItems: "center",
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
    const [{ favoriteChallenges, map }] = useDashboard();

    const onRowClick = (lat: number | undefined, long: number | undefined) => {
        if (!lat || !long || !map) return;
        map.flyTo({
            center: [long, lat],
            zoom: 10,
        });
    };

    return (
        <>
            <Box width="100%">
                <Box display="flex" justifyContent="space-between">
                    <Typography
                        variant="h5"
                        component="h4"
                        color="primary.onContainer"
                    >
                        Accepted Challenges
                    </Typography>
                    <Button
                        size="small"
                        color="primary"
                        variant="text"
                        LinkComponent={Link}
                        href="/app/challenges"
                    >
                        All Challenges
                    </Button>
                </Box>
                <Divider
                    sx={{
                        backgroundColor: "primary.onContainer",
                        height: "2px",
                        marginTop: "12px",
                    }}
                />
            </Box>
            <Box sx={containerStyles}>
                {favoriteChallenges && favoriteChallenges.length > 0 ? (
                    <Box sx={listStyles}>
                        {favoriteChallenges
                            .sort(
                                (a, b) =>
                                    (a.total - a.completed) / a.total -
                                    (b.total - b.completed) / b.total
                            )
                            .map((challenge) => (
                                <ChallengeRow
                                    challenge={challenge}
                                    key={challenge.id}
                                    onClick={onRowClick}
                                />
                            ))}
                    </Box>
                ) : (
                    <>
                        <Typography
                            variant="body1"
                            color="secondary.onContainerDim"
                            textAlign="center"
                        >
                            Looks like you haven't accepted any challenges yet!
                        </Typography>
                        <Button
                            size="small"
                            color="primary"
                            variant="text"
                            LinkComponent={Link}
                            href="/app/challenges"
                        >
                            View Challenges
                        </Button>
                    </>
                )}
            </Box>
        </>
    );
};

export default IncompleteChallenges;
