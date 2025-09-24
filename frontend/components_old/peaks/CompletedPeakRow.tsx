import hexToRgb from "@/helpers/hexToRgb";
import metersToFt from "@/helpers/metersToFt";
import PeakSummit from "@/typeDefs/PeakSummit";
import {
    Avatar,
    Box,
    Button,
    ButtonBase,
    SxProps,
    Theme,
    Typography,
} from "@mui/material";
import Link from "next/link";
import React from "react";

const rowStyles: SxProps<Theme> = (theme) => ({
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-start",
    gap: "12px",
    padding: "8px",
    borderRadius: "12px",
    backgroundColor: "primary.container",
    position: "relative",
    overflow: "hidden",
    minHeight: "54px",
    width: "100%",
    transition: "box-shadow 0.2s",
    cursor: "pointer",
    marginTop: "8px",
    "&:hover": {
        boxShadow: `0px 3px 3px -2px rgba(${hexToRgb(
            theme.palette.primary.base
        )}, 0.2), 0px 3px 4px 0px rgba(${hexToRgb(
            theme.palette.primary.base
        )}, 0.14), 0px 1px 8px 0px rgba(${hexToRgb(
            theme.palette.primary.base
        )}, 0.12);`,
    },
});

type Props = {
    peak: PeakSummit;
    onClick: (lat: number, long: number) => void;
    units: "metric" | "imperial";
};

const CompletedPeakRow = ({ peak, onClick, units }: Props) => {
    const color =
        (peak.Altitude ?? 0) < 1000
            ? "primary"
            : (peak.Altitude ?? 0) < 3000
            ? "secondary"
            : "tertiary";

    return (
        <ButtonBase
            sx={rowStyles}
            LinkComponent={Link}
            href={`/app/peaks/${peak.Id}`}
            onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
            }}
        >
            <Avatar
                sx={{
                    backgroundColor: "primary.containerDim",
                    color: "primary.onContainerDim",
                }}
            >
                {peak.ascents.length}
            </Avatar>
            <Box
                display="flex"
                alignItems="flex-start"
                flexDirection="column"
                flex="1"
                gap="4px"
            >
                <Typography
                    variant="body1"
                    fontWeight="bold"
                    color="primary.onContainerDim"
                    textAlign="left"
                >
                    {peak.Name}
                </Typography>
                <Typography variant="caption" color="primary.onContainerDim">
                    {peak.Country ? `${peak.Country}` : ""}
                    {peak.State ? ` | ${peak.State}` : ""}
                    {peak.County ? ` | ${peak.County}` : ""}
                </Typography>
                <Typography variant="body2" color="primary.onContainer">
                    Last ascent:{" "}
                    {new Date(
                        peak.ascents.sort(
                            (a, b) =>
                                new Date(b.timestamp).getTime() -
                                new Date(a.timestamp).getTime()
                        )[0]?.timestamp
                    ).toLocaleDateString()}
                </Typography>
            </Box>
            <Box
                display="flex"
                justifySelf="flex-end"
                flexDirection="column"
                gap="8px"
            >
                {peak.Altitude && (
                    <Box
                        sx={{
                            backgroundColor: `${color}.onContainerDim`,
                            padding: "8px",
                            borderRadius: "8px",
                        }}
                    >
                        <Typography
                            variant="body1"
                            color={`${color}.containerDim`}
                            textAlign="center"
                        >
                            {Math.round(
                                units === "metric"
                                    ? peak.Altitude
                                    : metersToFt(peak.Altitude)
                            )
                                .toString()
                                .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                            {units === "metric" ? " m" : " ft"}
                        </Typography>
                    </Box>
                )}
                <Button
                    size="small"
                    variant="text"
                    onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        onClick(peak.Lat, peak.Long);
                    }}
                >
                    Fly to Peak
                </Button>
            </Box>
        </ButtonBase>
    );
};

export default CompletedPeakRow;
