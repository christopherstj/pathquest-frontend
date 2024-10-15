"use client";
import { Box, IconButton, SxProps, Typography } from "@mui/material";
import { usePathname, useRouter } from "next/navigation";
import React from "react";

const containerStyles: SxProps = {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "4px",
    width: "100%",
    cursor: "pointer",
    padding: "8px",
    maxWidth: {
        xs: "72px",
        md: "none",
    },
    flexBasis: {
        xs: "72px",
        md: "none",
    },
    "&:hover": {
        ".MuiIconButton-root": {
            backgroundColor: "primary.containerDim",
        },
    },
};

const iconButtonStyles = (selected: boolean): SxProps => ({
    borderRadius: "12px",
    height: "24px",
    width: "100%",
    color: "primary.onContainerDim",
    backgroundColor: selected ? "primary.containerDim" : "transparent",
});

type Props = {
    href: string;
    label: string;
    icon: React.ReactNode;
};

const LinkButton = ({ href, label, icon }: Props) => {
    const pathname = usePathname();
    const router = useRouter();

    const selected = pathname === href;

    const redirect = () => router.push(href);

    React.useEffect(() => {
        router.prefetch(href);
    }, [router, href]);

    return (
        <Box sx={containerStyles} onClick={redirect}>
            <IconButton sx={iconButtonStyles(selected)} color="primary">
                {icon}
            </IconButton>
            <Typography
                variant="caption"
                color="primary.onContainer"
                textAlign="center"
            >
                {label}
            </Typography>
        </Box>
    );
};

export default LinkButton;
