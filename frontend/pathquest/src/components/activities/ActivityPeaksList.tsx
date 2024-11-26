"use client";
import { useActivityDetail } from "@/state/ActivityDetailsContext";
import { useUser } from "@/state/UserContext";
import { Box, Divider, SxProps, useTheme } from "@mui/material";
import React, { Fragment } from "react";
import UnclimbedPeakRow from "../dashboard/UnclimbedPeakRow";

const cardStyles: SxProps = {
    borderRadius: "12px",
    backgroundColor: `primary.container`,
    paddingRight: "4px",
    paddingLeft: "8px",
    paddingTop: "8px",
    boxShadow: 3,
    display: "flex",
    flexDirection: "column",
    gap: "12px",
    width: "100%",
    minHeight: "70vh",
    maxHeight: {
        xs: "70vh",
        md: "calc(100vh - 32px)",
    },
    flex: 1,
};

const listStyles: SxProps = {
    borderRadius: "12px",
    backgroundColor: "primary.container",
    padding: 0,
    flex: 1,
    overflowY: "scroll",
    paddingRight: "4px",
    "&::-webkit-scrollbar": {
        width: "8px",
    },
    "&::-webkit-scrollbar-thumb": {
        backgroundColor: "primary.onContainer",
        borderRadius: "8px",
    },
    "&::-webkit-scrollbar-thumb:hover": {
        backgroundColor: "primary.onContainerDim",
    },
    "&::-webkit-scrollbar-track": {
        backgroundColor: "transparent",
    },
};

const ActivityPeaksList = () => {
    const [{ activity, peakSummits, map }] = useActivityDetail();
    const [{ user }] = useUser();

    const units = user?.units ?? "metric";

    const onRowClick = (lat: number, long: number) => {
        map?.flyTo({
            center: [long, lat],
        });
    };

    return (
        <Box sx={cardStyles}>
            <Box sx={listStyles}>
                {peakSummits
                    .sort((a, b) => (b.Altitude ?? 0) - (a.Altitude ?? 0))
                    .map((peak) => (
                        <Fragment key={peak.Id}>
                            <UnclimbedPeakRow
                                rowColor="primary"
                                units={units}
                                onRowClick={onRowClick}
                                peak={{
                                    Id: peak.Id,
                                    Name: peak.Name,
                                    Altitude: peak.Altitude,
                                    Lat: peak.Lat,
                                    Long: peak.Long,
                                    isSummitted: true,
                                    isFavorited: false,
                                }}
                                ascents={peak.ascents.map((a) => ({
                                    ...a,
                                    timezone: activity.timezone,
                                }))}
                                useAscentRedirect={false}
                            />
                            <Divider
                                sx={{
                                    backgroundColor: "primary.onContainerDim",
                                    margin: "0 8px",
                                }}
                            />
                        </Fragment>
                    ))}
            </Box>
        </Box>
    );
};

export default ActivityPeaksList;
