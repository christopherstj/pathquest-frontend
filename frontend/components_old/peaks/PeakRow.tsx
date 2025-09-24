import hexToRgb from "@/helpers/hexToRgb";
import Peak from "@/typeDefs/Peak";
import { Box, ButtonBase, SxProps, Theme, Typography } from "@mui/material";
import Link from "next/link";
import React from "react";

const rowStyles: SxProps<Theme> = (theme) => ({
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "12px",
    padding: "8px",
    borderRadius: "12px",
    backgroundColor: "secondary.containerDim",
    position: "relative",
    overflow: "hidden",
    minHeight: "54px",
    width: {
        xs: "100%",
        md: "auto",
    },
    transition: "box-shadow 0.2s",
    cursor: "pointer",
    "&:hover": {
        boxShadow: `0px 3px 3px -2px rgba(${hexToRgb(
            theme.palette.secondary.base
        )}, 0.2), 0px 3px 4px 0px rgba(${hexToRgb(
            theme.palette.secondary.base
        )}, 0.14), 0px 1px 8px 0px rgba(${hexToRgb(
            theme.palette.secondary.base
        )}, 0.12);`,
    },
});

type Props = {
    peak: Peak;
};

const PeakRow = ({ peak }: Props) => {
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
        >
            <Box display="flex" flexDirection="column">
                <Typography
                    variant="body1"
                    fontWeight="bold"
                    color="secondary.onContainerDim"
                >
                    {peak.Name}
                </Typography>
                <Typography variant="caption" color="secondary.onContainerDim">
                    {peak.Country ? `${peak.Country}` : ""}
                    {peak.State ? ` | ${peak.State}` : ""}
                    {peak.County ? ` | ${peak.County}` : ""}
                </Typography>
            </Box>
            {peak.Altitude && (
                <Box
                    sx={{
                        backgroundColor: `${color}.onContainerDim`,
                        padding: "8px",
                        borderRadius: "8px",
                    }}
                >
                    <Typography variant="body1" color={`${color}.containerDim`}>
                        {peak.Altitude.toString().replace(
                            /\B(?=(\d{3})+(?!\d))/g,
                            ","
                        )}
                        m
                    </Typography>
                </Box>
            )}
        </ButtonBase>
    );
};

export default PeakRow;
