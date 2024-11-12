"use client";
import { useChallengeDetail } from "@/state/ChallengeDetailContext";
import { Box, List, SxProps } from "@mui/material";
import React from "react";
import ChallengePeaksDisplayButtons from "./ChallengePeaksDisplayButtons";
import ChallengePeaksSearch from "./ChallengePeaksSearch";
import { Virtuoso } from "react-virtuoso";
import UnclimbedPeakRow from "../dashboard/UnclimbedPeakRow";
import { useUser } from "@/state/UserContext";
// import ChallengePeakRow from "./ChallengePeakRow";

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
    // paddingRight: "4px",
    // paddingLeft: "8px",
    flex: 1,
    overflowY: "scroll",
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
    const [{ peaks }] = useChallengeDetail();
    const [{ user }] = useUser();

    const units = user?.units ?? "metric";

    const [display, setDisplay] = React.useState<
        "all" | "completed" | "unclimbed"
    >("all");
    const [search, setSearch] = React.useState<string>("");

    return (
        <Box sx={cardStyles}>
            <ChallengePeaksDisplayButtons
                value={display}
                setValue={setDisplay}
            />
            <ChallengePeaksSearch value={search} setValue={setSearch} />
            <Box sx={listStyles}>
                {peaks
                    .filter(({ peak }) => {
                        if (display === "completed") return peak.isSummitted;
                        if (display === "unclimbed") return !peak.isSummitted;
                        return true;
                    })
                    .filter(({ peak }) =>
                        peak.Name.toLowerCase().includes(search.toLowerCase())
                    )
                    .sort(
                        (a, b) =>
                            (b.peak.Altitude ?? 0) - (a.peak.Altitude ?? 0)
                    )
                    .map(({ peak }) => (
                        <UnclimbedPeakRow
                            rowColor="primary"
                            units={units}
                            onFavoriteClick={(peakId, newValue) =>
                                console.log(peakId, newValue)
                            }
                            onRowClick={(lat, long) => console.log(lat, long)}
                            peak={peak}
                            key={peak.Id}
                        />
                    ))}
            </Box>
            {/* <Box flex="1">
                <List sx={{ height: "100%", gap: "12px" }}>
                    {peaks
                        .filter(({ peak }) => {
                            if (display === "completed")
                                return peak.isSummitted;
                            if (display === "unclimbed")
                                return !peak.isSummitted;
                            return true;
                        })
                        .map(({ peak }) => (
                            <ChallengePeakRow peak={peak} key={peak.Id} />
                        ))}
                </List>
            </Box> */}
        </Box>
    );
};

export default ChallengePeaksList;
