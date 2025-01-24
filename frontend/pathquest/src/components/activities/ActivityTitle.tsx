"use client";
import { useActivityDetail } from "@/state/ActivityDetailsContext";
import { MoreVert } from "@mui/icons-material";
import { Box, Divider, IconButton, Typography } from "@mui/material";
import React from "react";
import ActivityMenu from "./ActivityMenu";

const ActivityTitle = () => {
    const [
        {
            activity: { name, id },
        },
    ] = useActivityDetail();

    return (
        <>
            <Box
                sx={{
                    display: "flex",
                    alignItems: "center",
                }}
            >
                <Typography
                    variant="h4"
                    color="primary.onContainer"
                    sx={{
                        flex: {
                            md: 1,
                        },
                    }}
                >
                    {name}
                </Typography>
                <ActivityMenu activityId={id} />
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

export default ActivityTitle;
