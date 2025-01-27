import { MoreVert } from "@mui/icons-material";
import { IconButton, List, Popover } from "@mui/material";
import React from "react";
import DeleteActivityButton from "./DeleteActivityButton";
import ReprocessActivityButton from "./ReprocessActivityButton";

type Props = {
    activityId: string;
};

const ActivityMenu = ({ activityId }: Props) => {
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
                <List>
                    <DeleteActivityButton activityId={activityId} />
                    <ReprocessActivityButton activityId={activityId} />
                </List>
            </Popover>
        </>
    );
};

export default ActivityMenu;
