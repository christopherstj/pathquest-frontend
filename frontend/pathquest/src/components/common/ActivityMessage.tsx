"use client";
import { useMessage } from "@/state/MessageContext";
import { useUser } from "@/state/UserContext";
import { Close } from "@mui/icons-material";
import {
    Alert,
    IconButton,
    Snackbar,
    SnackbarCloseReason,
    SxProps,
} from "@mui/material";
import React from "react";

const alertSx: SxProps = {
    color: "secondary.onContainerDim",
    ".MuiSvgIcon-root": {
        color: "white",
    },
    borderRadius: "16px",
    padding: "8px 16px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: 3,
    width: "100%",
    backgroundColor: "secondary.containerDim",
};

type Props = {};

const ActivityMessage = (props: Props) => {
    const [{ user }] = useUser();

    const [messageText, setMessageText] = React.useState<string | null>(null);

    const handleClose = (
        event?: React.SyntheticEvent | Event,
        reason?: SnackbarCloseReason
    ) => {
        if (reason === "clickaway") {
            return;
        }

        setMessageText(null);
    };

    const getMessage = () => {
        if (!user) return null;
        if (!user.historicalDataProcessed)
            return "Retrieving your historical data...";
        if (!user.processingActivityCount || user.processingActivityCount === 0)
            return null;
        return `Processing ${user.processingActivityCount} activities...`;
    };

    React.useEffect(() => {
        setMessageText(getMessage());
    }, [user]);

    const showMessage = messageText !== null;

    return messageText === null ? null : (
        <Snackbar
            anchorOrigin={{
                vertical: "bottom",
                horizontal: "right",
            }}
            open={showMessage}
            onClose={handleClose}
        >
            <Alert sx={alertSx}>
                {messageText}{" "}
                <IconButton
                    size="small"
                    aria-label="close"
                    color="inherit"
                    onClick={handleClose}
                >
                    <Close fontSize="small" />
                </IconButton>
            </Alert>
        </Snackbar>
    );
};

export default ActivityMessage;
