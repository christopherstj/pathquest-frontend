"use client";
import reprocessActivity from "@/actions/reprocessActivity";
import { Delete, Refresh } from "@mui/icons-material";
import { ListItemButton, ListItemIcon, ListItemText } from "@mui/material";
import React from "react";
import ConfirmDialog from "../common/ConfirmDialog";
import { useMessage } from "@/state/MessageContext";

type Props = {
    activityId: string;
    disabled?: boolean;
    onSuccess: () => void;
};

const ReprocessActivityButton = ({
    activityId,
    disabled,
    onSuccess,
}: Props) => {
    const [, dispatch] = useMessage();

    const [modalOpen, setModalOpen] = React.useState(false);
    const [loading, setLoading] = React.useState(false);

    const handleOpen = () => {
        setModalOpen(true);
    };

    const onDelete = async () => {
        setLoading(true);
        const result = await reprocessActivity(activityId);
        if (result.success) {
            dispatch({
                type: "SET_MESSAGE",
                payload: {
                    type: "success",
                    text: "Activity reprocessing requested",
                },
            });
            onSuccess();
        } else {
            dispatch({
                type: "SET_MESSAGE",
                payload: {
                    type: "error",
                    text: "Error requesting activity reprocessing",
                },
            });
        }
        setLoading(false);
        setModalOpen(false);
    };

    return (
        <>
            <ListItemButton onClick={handleOpen} disabled={loading || disabled}>
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
                description="Reprocessing an activity will recalculate all auto-calculated peak summits, but maintain your manual summits. It will pull fresh data for elevation, coordinates, distance, and time. Activity reprocessing usually takes only a couple minutes, but can take up to a day"
                onConfirm={onDelete}
                confirmText="Request Reprocessing"
                onCancel={() => setModalOpen(false)}
                cancelText="Cancel"
            />
        </>
    );
};

export default ReprocessActivityButton;
