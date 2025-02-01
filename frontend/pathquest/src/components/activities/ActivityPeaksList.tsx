"use client";
import { useActivityDetail } from "@/state/ActivityDetailsContext";
import { useUser } from "@/state/UserContext";
import { Box, Divider, SxProps, Typography, useTheme } from "@mui/material";
import React, { Fragment } from "react";
import UnclimbedPeakRow from "../dashboard/UnclimbedPeakRow";
import Ascent from "@/typeDefs/Ascent";
import UnclimbedPeak from "@/typeDefs/UnclimbedPeak";
import Peak from "@/typeDefs/Peak";
import AscentModal from "../peaks/AscentModal";
import AscentDetail from "@/typeDefs/AscentDetail";
import { GeoJSONSource } from "mapbox-gl";

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
    // minHeight: "70vh",
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
    const [{ activity, peakSummits, map }, setActivityDetailState] =
        useActivityDetail();
    const [{ user }] = useUser();

    const [selectedSummit, setSelectedSummit] = React.useState<string | null>(
        null
    );

    const units = user?.units ?? "metric";

    const onRowClick = (lat: number, long: number) => {
        map?.flyTo({
            center: [long, lat],
        });
    };

    const onAscentClick = (ascentId: string) => {
        setSelectedSummit(ascentId);
    };

    const closeAscentDetail = () => {
        setSelectedSummit(null);
    };

    const onDeleteAscent = (ascentId: string) => {
        const newSummits = peakSummits
            .map((peak) => {
                return {
                    ...peak,
                    ascents: peak.ascents.filter((a) => a.id !== ascentId),
                };
            })
            .filter((peak) => peak.ascents.length > 0);

        setActivityDetailState((state) => ({
            ...state,
            peakSummits: newSummits,
        }));

        const source = map?.getSource("peaks") as GeoJSONSource;

        if (!source) {
            return;
        }

        source.setData({
            type: "FeatureCollection",
            features: newSummits.map((peak) => ({
                type: "Feature",
                geometry: {
                    type: "Point",
                    coordinates: [peak.Long, peak.Lat],
                },
                properties: {
                    id: peak.Id,
                    ...peak,
                },
            })),
        });
    };

    const onUpdateAscent = (ascent: AscentDetail) => {
        const newSummits = peakSummits.map((peak) => {
            if (peak.Id === ascent.peakId) {
                return {
                    ...peak,
                    ascents: peak.ascents.map((a) =>
                        a.id === ascent.id ? ascent : a
                    ),
                };
            }
            return peak;
        });

        setActivityDetailState((state) => ({
            ...state,
            peakSummits: newSummits,
        }));
    };

    const modalOpen = Boolean(selectedSummit);

    return (
        <Box sx={cardStyles}>
            {peakSummits.length > 0 ? (
                <Box sx={listStyles}>
                    {peakSummits
                        .sort((a, b) => (b.Altitude ?? 0) - (a.Altitude ?? 0))
                        .map((peak, index) => (
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
                                    onSummitControlDetailClick={onAscentClick}
                                />
                                {index !== peakSummits.length - 1 && (
                                    <Divider
                                        sx={{
                                            backgroundColor:
                                                "primary.onContainerDim",
                                            margin: "0 8px",
                                        }}
                                    />
                                )}
                            </Fragment>
                        ))}
                </Box>
            ) : (
                <Typography
                    variant="h6"
                    color="primary.onContainerDim"
                    textAlign="center"
                >
                    Looks like you didn't summit any peaks on this activity!
                </Typography>
            )}
            <AscentModal
                open={modalOpen}
                onClose={closeAscentDetail}
                ascentId={selectedSummit}
                currentActivityId={activity.id}
                onComplete={onUpdateAscent}
                onDelete={onDeleteAscent}
            />
        </Box>
    );
};

export default ActivityPeaksList;
