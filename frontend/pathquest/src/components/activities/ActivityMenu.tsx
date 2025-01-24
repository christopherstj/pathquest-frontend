import deleteActivity from "@/actions/deleteActivity";
import { Delete, MoreVert } from "@mui/icons-material";
import {
    IconButton,
    List,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Popover,
    Typography,
} from "@mui/material";
import React from "react";
import ConfirmDialog from "../common/ConfirmDialog";

type Props = {
    activityId: string;
};

const ActivityMenu = ({ activityId }: Props) => {
    const [anchorEl, setAnchorEl] = React.useState<HTMLButtonElement | null>(
        null
    );
    const [modalOpen, setModalOpen] = React.useState(false);
    const [loading, setLoading] = React.useState(false);

    const handleOpen = () => {
        setModalOpen(true);
    };

    const onDelete = async () => {
        setLoading(true);
        await deleteActivity(activityId);
        setLoading(false);
        setModalOpen(false);
    };

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
                    <ListItemButton onClick={handleOpen}>
                        <ListItemIcon>
                            <Delete />
                        </ListItemIcon>
                        <ListItemText primary="Delete" />
                    </ListItemButton>
                </List>
            </Popover>
            <ConfirmDialog
                loading={loading}
                open={modalOpen}
                onClose={() => setModalOpen(false)}
                title="Delete Activity"
                description="Are you sure you want to delete this activity? This action cannot be undone."
                onConfirm={onDelete}
                confirmText="Yes, Delete"
                onCancel={() => setModalOpen(false)}
                cancelText="Cancel"
            />
        </>
    );
};

export default ActivityMenu;
