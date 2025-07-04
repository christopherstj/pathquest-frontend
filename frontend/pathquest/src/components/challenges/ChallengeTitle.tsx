"use client";
import { useChallengeDetail } from "@/state/ChallengeDetailContext";
import { Box, Divider, Typography } from "@mui/material";
import React from "react";
import ChallengeSubscribeButton from "./ChallengeSubscribeButton";
import DropdownMenu from "../common/DropdownMenu";
import ChallengePrivacyButton from "./ChallengePrivacyButton";

const ChallengeTitle = () => {
    const [{ challenge }] = useChallengeDetail();

    return (
        <>
            <Box
                sx={{
                    display: "flex",
                    alignItems: "flex-start",
                    pr: {
                        xs: "48px",
                        md: "0px",
                    },
                }}
            >
                <Box flex="1" display="flex" flexDirection="column">
                    <Typography variant="h4" color="primary.onContainer">
                        {challenge.name}
                    </Typography>
                </Box>
                <ChallengeSubscribeButton />
                {challenge.isFavorited && (
                    <DropdownMenu>
                        <ChallengePrivacyButton />
                    </DropdownMenu>
                )}
            </Box>
            <Divider
                color="primary"
                sx={{
                    margin: "12px 0px",
                }}
            />
        </>
    );
};

export default ChallengeTitle;
