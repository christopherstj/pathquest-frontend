"use client";
import deleteUser from "@/actions/users/deleteUser";
import { useIsMobile } from "@/helpers/useIsMobile";
import { useMessage } from "@/state_old/MessageContext";
import { Delete, Landscape, Logout } from "@mui/icons-material";
import {
    Box,
    Fab,
    List,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Popover,
    Stack,
    SxProps,
    Typography,
} from "@mui/material";
import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import React from "react";
import DeleteButton from "./DeleteButton";

const fabStyles = (isMobile: boolean): SxProps => ({
    width: "40px",
    height: "40px",
    borderRadius: "8px",
    margin: "0 auto",
    backgroundColor: "tertiary.base",
    color: "tertiary.onContainer",
    ...(isMobile && {
        position: "fixed",
        top: "8px",
        right: "8px",
    }),
});

const buttonStyles: SxProps = {
    borderRadius: "24px",
    height: "40px",
    width: "40px",
    flexBasis: {
        xs: "40px",
        md: "none",
    },
    margin: {
        xs: "0px",
        md: "0 auto",
    },
    border: "1px solid",
    borderColor: "primary.onContainer",
    color: "primary.onContainer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    background: "transparent",
    transition: "background-color 0.2s",
    fontSize: {
        xs: "1rem",
        md: "1.5rem",
    },
    "&:hover": {
        backgroundColor: "primary.containerDim",
    },
};

const fixedContainerStyles: SxProps = {
    position: "fixed",
    top: "8px",
    right: "8px",
    padding: "4px",
    backgroundColor: "primary.container",
    borderRadius: "50%",
    boxShadow: 3,
    zIndex: 9999,
};

const UserButton = () => {
    const { data } = useSession();

    const isMobile = useIsMobile();

    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

    if (!data) {
        return isMobile === null ? null : (
            <Fab
                sx={fabStyles(!!isMobile)}
                LinkComponent={Link}
                href="/app"
                size="small"
            >
                <Landscape />
            </Fab>
        );
    }

    const logout = async () => {
        const res = await signOut();
    };

    const openPopover = (event: React.MouseEvent<HTMLButtonElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const closePopover = () => {
        setAnchorEl(null);
    };

    const popoverOpen = Boolean(anchorEl);
    const popoverId = popoverOpen ? "user-popover" : undefined;

    const name = data.user?.name;

    const firstLetter = name ? name[0].toUpperCase() : "";

    const internalDisplay = (
        <>
            <Box sx={buttonStyles} component="button" onClick={openPopover}>
                <Typography variant="h6" color="primary.onContainer">
                    {firstLetter}
                </Typography>
            </Box>
            <Popover
                id={popoverId}
                open={popoverOpen}
                anchorEl={anchorEl}
                onClose={closePopover}
                anchorOrigin={{
                    vertical: "bottom",
                    horizontal: "left",
                }}
                transformOrigin={{
                    vertical: "top",
                    horizontal: "left",
                }}
                slotProps={{
                    paper: {
                        sx: {
                            borderRadius: "12px",
                        },
                    },
                }}
            >
                <List sx={{ color: "primary.onContainer" }}>
                    <ListItem disablePadding>
                        <ListItemButton onClick={logout} color="primary">
                            <ListItemIcon>
                                <Logout sx={{ color: "primary.onContainer" }} />
                            </ListItemIcon>
                            <ListItemText primary="Sign Out" />
                        </ListItemButton>
                    </ListItem>
                    <DeleteButton />
                </List>
            </Popover>
        </>
    );

    return isMobile === null ? null : isMobile ? (
        <Box sx={fixedContainerStyles}>{internalDisplay}</Box>
    ) : (
        internalDisplay
    );
};

export default UserButton;
