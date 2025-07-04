"use client";
import { MoreVert } from "@mui/icons-material";
import { IconButton, List, Popover } from "@mui/material";
import React from "react";

type Props = {
    children?: React.ReactNode;
};

const DropdownMenu = ({ children }: Props) => {
    const [anchorEl, setAnchorEl] = React.useState<HTMLButtonElement | null>(
        null
    );

    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const open = Boolean(anchorEl);
    const id = open ? "simple-popover" : undefined;
    return (
        <>
            <IconButton color="primary" onClick={handleClick}>
                <MoreVert />
            </IconButton>
            <Popover
                id={id}
                open={open}
                anchorEl={anchorEl}
                onClose={handleClose}
                anchorOrigin={{
                    vertical: "bottom",
                    horizontal: "right",
                }}
                transformOrigin={{
                    vertical: "top",
                    horizontal: "right",
                }}
            >
                <List>{children}</List>
            </Popover>
        </>
    );
};

export default DropdownMenu;
