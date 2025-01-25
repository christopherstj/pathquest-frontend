"use client";
import { useChallengeDetail } from "@/state/ChallengeDetailContext";
import { Box, Divider, SxProps, useTheme } from "@mui/material";
import React, { Fragment } from "react";
import ChallengePeaksDisplayButtons from "./ChallengePeaksDisplayButtons";
import ChallengePeaksSearch from "./ChallengePeaksSearch";
import UnclimbedPeakRow from "../dashboard/UnclimbedPeakRow";
import { useUser } from "@/state/UserContext";
import onFavoriteClick from "./helpers/onFavoriteClick";

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

const ChallengePeaksList = () => {
    const [{ peaks, map }, setChallengeDetailState] = useChallengeDetail();
    const [{ user }] = useUser();

    const theme = useTheme();

    const units = user?.units ?? "metric";

    const [display, setDisplay] = React.useState<
        "all" | "completed" | "unclimbed"
    >("all");
    const [search, setSearch] = React.useState<string>("");

    const onRowClick = (lat: number, long: number) => {
        map?.flyTo({
            center: [long, lat],
            zoom: 12,
        });
    };

    return (
        <Box sx={cardStyles}>
            <ChallengePeaksDisplayButtons
                value={display}
                setValue={setDisplay}
            />
            <ChallengePeaksSearch value={search} setValue={setSearch} />
            <Box sx={listStyles}>
                {peaks
                    .filter((peak) => {
                        if (display === "completed") return peak.isSummitted;
                        if (display === "unclimbed") return !peak.isSummitted;
                        return true;
                    })
                    .filter((peak) =>
                        peak.Name.toLowerCase().includes(search.toLowerCase())
                    )
                    .sort((a, b) => (b.Altitude ?? 0) - (a.Altitude ?? 0))
                    .map(({ ascents, ...peak }) => (
                        <Fragment key={peak.Id}>
                            <UnclimbedPeakRow
                                rowColor="primary"
                                units={units}
                                onFavoriteClick={(peakId, newValue) =>
                                    onFavoriteClick(
                                        peaks,
                                        setChallengeDetailState,
                                        map,
                                        theme,
                                        units,
                                        peakId,
                                        newValue,
                                        true,
                                        false
                                    )
                                }
                                onRowClick={onRowClick}
                                peak={peak}
                                ascents={ascents}
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

export default ChallengePeaksList;
