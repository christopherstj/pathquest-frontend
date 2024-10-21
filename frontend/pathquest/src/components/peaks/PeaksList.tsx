"use client";
import { usePeaks } from "@/state/PeaksContext";
import { usePeaksMap } from "@/state/PeaksMapContext";
import { useUser } from "@/state/UserContext";
import PeakSummit from "@/typeDefs/PeakSummit";
import UnclimbedPeak from "@/typeDefs/UnclimbedPeak";
import { Box, SxProps } from "@mui/material";
import React from "react";
import CompletedPeakRow from "./CompletedPeakRow";
import { Virtuoso } from "react-virtuoso";
import TextField from "../common/TextField";
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
    width: "100%",
    flex: 1,
    ".peaks-list": {
        height: "100%",
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
    },
};

const PeaksList = () => {
    const [{ peakSelection }, setPeaksState] = usePeaks();
    const [peaksMap, setPeaksMapState] = usePeaksMap();
    const [{ user }] = useUser();

    const [search, setSearch] = React.useState<string>("");

    if (!user) return null;

    const { units } = user;

    const onRowClick = (lat: number, long: number) => {
        peaksMap.map?.flyTo({
            center: [long, lat],
            zoom: 12,
        });
    };

    return (
        <Box sx={cardStyles}>
            <TextField
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                color="primary"
                placeholder="Search peaks"
                sx={{
                    marginRight: "8px",
                }}
            />
            {peakSelection.type === "completed" ? (
                <Virtuoso
                    className="peaks-list"
                    data={peakSelection.data.sort(
                        (a, b) => b.ascents.length - a.ascents.length
                    )}
                    itemContent={(_, peak) => (
                        <CompletedPeakRow
                            key={peak.Id}
                            peak={peak}
                            units={units}
                            onClick={onRowClick}
                        />
                    )}
                />
            ) : (
                <Virtuoso
                    className="peaks-list"
                    data={peakSelection.data.sort(
                        (a, b) => (b.Altitude ?? 0) - (a.Altitude ?? 0)
                    )}
                    itemContent={(_, peak) => (
                        <UnclimbedPeakRow
                            key={peak.Id}
                            peak={peak}
                            rowColor="primary"
                            units={units}
                            onRowClick={onRowClick}
                            onFavoriteClick={(peakId, newValue) => {}}
                        />
                    )}
                />
            )}
        </Box>
    );
};

export default PeaksList;
