"use client";
import reprocessActivity from "@/actions/reprocessActivity";
import { Delete, Refresh } from "@mui/icons-material";
import { ListItemButton, ListItemIcon, ListItemText } from "@mui/material";
import React from "react";
import ConfirmDialog from "../common/ConfirmDialog";

type Props = {
    activityId: string;
};

const ReprocessActivityButton = ({ activityId }: Props) => {
    const [modalOpen, setModalOpen] = React.useState(false);
    const [loading, setLoading] = React.useState(false);

    const handleOpen = () => {
        setModalOpen(true);
    };

    const onDelete = async () => {
        setLoading(true);
        await reprocessActivity(activityId);
        setLoading(false);
        setModalOpen(false);
    };

    return (
        <>
            <ListItemButton onClick={handleOpen}>
                <ListItemIcon>
                    <Refresh />
                </ListItemIcon>
                <ListItemText primary="Request Reprocessing" />
            </ListItemButton>
            <ConfirmDialog
                loading={loading}
                open={modalOpen}
                onClose={() => setModalOpen(false)}
                title="Request Activity Reprocessing"
                description="Activity reprocessing usually takes around 15 minutes, but can take up to a day"
                onConfirm={onDelete}
                confirmText="Request Reprocessing"
                onCancel={() => setModalOpen(false)}
                cancelText="Cancel"
            />
        </>
    );
};

export default ReprocessActivityButton;
