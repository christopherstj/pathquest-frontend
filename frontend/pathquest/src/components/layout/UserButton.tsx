"use client";
import { Landscape, Logout } from "@mui/icons-material";
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

const fabStyles: SxProps = {
    width: "40px",
    height: "40px",
    borderRadius: "8px",
    margin: "0 auto",
    backgroundColor: "tertiary.base",
    color: "tertiary.onContainer",
};

const buttonStyles: SxProps = {
    borderRadius: "24px",
    height: "40px",
    width: "40px",
    margin: "0 auto",
    border: "1px solid",
    borderColor: "primary.onContainer",
    color: "primary.onContainer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    background: "transparent",
    transition: "background-color 0.2s",
    "&:hover": {
        backgroundColor: "primary.containerDim",
    },
};

const UserButton = () => {
    const { data } = useSession();

    console.log(data);

    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

    if (!data) {
        return (
            <Fab sx={fabStyles} LinkComponent={Link} href="/" size="small">
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

    return (
        <>
            <Box sx={buttonStyles} component="button" onClick={openPopover}>
                <Typography
                    variant="h6"
                    fontSize="1.5rem"
                    color="primary.onContainer"
                >
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
                </List>
            </Popover>
        </>
    );
};

export default UserButton;
