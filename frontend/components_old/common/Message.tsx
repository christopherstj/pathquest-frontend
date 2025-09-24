"use client";
import React from "react";
import { SxProps } from "@mui/material/styles";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import { useMessage } from "@/state_old/MessageContext";

const alertStyles = (type: "success" | "error"): SxProps => ({
    color: type === "success" ? "primary.onContainerDim" : "white",
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
    backgroundColor:
        type === "success" ? "primary.containerDim" : "tertiary.base",
});

const Message = () => {
    const [{ message }] = useMessage();

    const [showMessage, setShowMessage] = React.useState<boolean>(false);
    const [timeoutId, setTimeoutId] = React.useState<NodeJS.Timeout | null>(
        null
    );

    const handleClose = () => {
        setShowMessage(false);
    };

    React.useEffect(() => {
        if (timeoutId) {
            clearTimeout(timeoutId);
        }
        if (message.text && message.text !== "") {
            setShowMessage(true);
            setTimeoutId(
                setTimeout(() => {
                    setShowMessage(false);
                }, message.timeout || 5000)
            );
        }
    }, [message]);

    const alertSx = alertStyles(message.type);

    return (
        <Snackbar open={showMessage} onClose={handleClose}>
            <Alert sx={alertSx} severity={message.type}>
                {message.text}
            </Alert>
        </Snackbar>
    );
};

export default Message;
