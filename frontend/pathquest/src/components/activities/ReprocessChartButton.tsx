"use client";
import reprocessActivity from "@/actions/activities/reprocessActivity";
import { Box, Button, Typography } from "@mui/material";
import React from "react";
import ConfirmDialog from "../common/ConfirmDialog";
import { useMessage } from "@/state/MessageContext";

type Props = {
    activityId: string;
    disabled?: boolean;
    onSuccess: () => void;
};

const ReprocessChartButton = ({ activityId, disabled, onSuccess }: Props) => {
    const [, dispatch] = useMessage();
    const [modalOpen, setModalOpen] = React.useState(false);
    const [loading, setLoading] = React.useState(false);

    const handleOpen = () => {
        setModalOpen(true);
    };

    const reprocess = async () => {
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
        <Box
            width="100%"
            display="flex"
            flexDirection="column"
            alignItems="center"
            gap="8px"
        >
            <Typography
                variant="body1"
                color="primary.onContainer"
                textAlign="center"
            >
                Looks like there's no data to display! This can happen if we
                weren't able to pull in the data for this activity. You can
                request a reprocessing of the data to try again.
            </Typography>
            <Button
                variant="outlined"
                onClick={handleOpen}
                color="primary"
                disabled={disabled || loading}
            >
                Request Reprocessing
            </Button>
            <ConfirmDialog
                loading={loading}
                open={modalOpen}
                onClose={() => setModalOpen(false)}
                title="Request Activity Reprocessing"
                description="Reprocessing an activity will recalculate all auto-calculated peak summits, but maintain your manual summits. It will pull fresh data for elevation, coordinates, distance, and time. Activity reprocessing usually takes only a couple minutes, but can take up to a day"
                onConfirm={reprocess}
                confirmText="Request Reprocessing"
                onCancel={() => setModalOpen(false)}
                cancelText="Cancel"
            />
        </Box>
    );
};

export default ReprocessChartButton;
