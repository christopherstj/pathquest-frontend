"use client";
import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    LinearProgress,
} from "@mui/material";
import React from "react";

type Props = {
    open: boolean;
    onClose: () => void;
    title: string;
    description: string;
    onConfirm: () => void;
    confirmText: string;
    onCancel: () => void;
    cancelText: string;
    loading?: boolean;
};

const ConfirmDialog = ({
    open,
    onClose,
    title,
    description,
    onConfirm,
    confirmText,
    onCancel,
    cancelText,
    loading = false,
}: Props) => {
    return (
        <Dialog open={open} onClose={onClose}>
            {loading && (
                <LinearProgress
                    color="primary"
                    sx={{ position: "absolute", top: 0, left: 0, right: 0 }}
                />
            )}
            <DialogTitle>{title}</DialogTitle>
            <DialogContent>
                <DialogContentText>{description}</DialogContentText>
            </DialogContent>
            <DialogActions>
                <Button color="primary" onClick={onCancel} variant="text">
                    {cancelText}
                </Button>
                <Button color="primary" onClick={onConfirm}>
                    {confirmText}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default ConfirmDialog;
