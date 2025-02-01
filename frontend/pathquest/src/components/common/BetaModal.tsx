"use client";
import createUserInterest from "@/actions/createUserInterest";
import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    LinearProgress,
    SxProps,
} from "@mui/material";
import React from "react";
import TextField from "./TextField";

const buttonStyles: SxProps = {
    borderRadius: "24px",
    backgroundColor: "transparent",
    borderColor: "primary.onContainer",
    color: "primary.onContainer",
    "&:hover": {
        backgroundColor: "primary.containerDim",
    },
};

const BetaModal = () => {
    const [open, setOpen] = React.useState(false);
    const [loading, setLoading] = React.useState(false);
    const [email, setEmail] = React.useState("");

    const onSubmit = async () => {
        setLoading(true);
        await createUserInterest(email);
        setLoading(false);
        handleClose();
    };

    const handleClose = () => {
        setOpen(false);
    };

    React.useEffect(() => {
        setOpen(true);
    }, []);

    return (
        <Dialog open={open} onClose={handleClose}>
            {loading && (
                <LinearProgress
                    color="secondary"
                    sx={{ position: "absolute", top: 0, left: 0, right: 0 }}
                />
            )}
            <DialogTitle>Interested in using PathQuest?</DialogTitle>
            <DialogContent>
                <DialogContentText>
                    PathQuest is currently in it's beta version. While we're
                    working tirelessly to bring it out as quickly as possible,
                    we'd love to keep you updated on our progress. Please enter
                    your email address below to stay in the loop!
                </DialogContentText>
                <TextField
                    color="primary"
                    autoFocus
                    margin="dense"
                    name="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    label="Email Address"
                    type="email"
                    fullWidth
                    variant="outlined"
                    disabled={loading}
                />
            </DialogContent>
            <DialogActions>
                <Button
                    onClick={handleClose}
                    disabled={loading}
                    variant="text"
                    color="primary"
                >
                    Cancel
                </Button>
                <Button onClick={onSubmit} disabled={loading} color="primary">
                    Subscribe
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default BetaModal;
