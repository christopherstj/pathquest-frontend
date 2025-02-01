import dayjs from "@/helpers/dayjs";
import PeakSummit from "@/typeDefs/PeakSummit";
import { Box, SxProps, Typography } from "@mui/material";
import { useRouter } from "next/navigation";
import React from "react";
import { Virtuoso } from "react-virtuoso";

const listStyles: SxProps = {
    height: "100%",
    minHeight: "200px",
    ".peaks-list": {
        height: "100%",
        "&::-webkit-scrollbar": {
            width: "4px",
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

type Props = {
    currentId: string;
    peak: PeakSummit;
    timezone: string;
    onAscentClick: (id: string) => void;
};

const OtherAscents = ({ currentId, peak, timezone, onAscentClick }: Props) => {
    return (
        <Box sx={listStyles}>
            <Virtuoso
                className="peaks-list"
                data={peak.ascents
                    .filter((a) => a.id !== currentId)
                    .sort(
                        (a, b) =>
                            dayjs(b.timestamp).unix() -
                            dayjs(a.timestamp).unix()
                    )}
                itemContent={(_, ascent) => (
                    <Box
                        key={ascent.id}
                        display="flex"
                        justifyContent={{
                            xs: "space-between",
                            md: "flex-end",
                        }}
                        gap="4px"
                        marginBottom="4px"
                        sx={{
                            cursor: "pointer",
                            opacity: 0.75,
                            "&:hover": {
                                opacity: 1,
                            },
                        }}
                        onClick={() => onAscentClick(ascent.id)}
                    >
                        <Typography
                            variant="body2"
                            color="primary.onContainerDim"
                        >
                            {dayjs(ascent?.timestamp)
                                .tz(timezone)
                                .format("MMM D, YYYY h:mm A")}
                        </Typography>
                    </Box>
                )}
            />
        </Box>
    );
};

export default OtherAscents;
