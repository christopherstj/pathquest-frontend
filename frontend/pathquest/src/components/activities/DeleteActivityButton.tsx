"use client";
import deleteActivity from "@/actions/deleteActivity";
import { Delete } from "@mui/icons-material";
import { ListItemButton, ListItemIcon, ListItemText } from "@mui/material";
import React from "react";
import ConfirmDialog from "../common/ConfirmDialog";

type Props = {
    activityId: string;
};

const DeleteActivityButton = ({ activityId }: Props) => {
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

    return (
        <>
            <ListItemButton onClick={handleOpen}>
                <ListItemIcon>
                    <Delete />
                </ListItemIcon>
                <ListItemText primary="Delete" />
            </ListItemButton>
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

export default DeleteActivityButton;
