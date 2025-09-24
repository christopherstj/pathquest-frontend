import deleteUser from "@/actions/users/deleteUser";
import { useMessage } from "@/state_old/MessageContext";
import { Delete } from "@mui/icons-material";
import {
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
} from "@mui/material";
import { signOut } from "next-auth/react";
import React from "react";
import ConfirmDialog from "../common/ConfirmDialog";

const DeleteButton = () => {
    const [, dispatch] = useMessage();

    const [modalOpen, setModalOpen] = React.useState(false);
    const [loading, setLoading] = React.useState(false);

    const handleOpen = () => {
        setModalOpen(true);
    };

    const onDelete = async () => {
        setLoading(true);
        const success = await deleteUser();
        if (success) {
            await signOut();
        } else {
            dispatch({
                type: "SET_MESSAGE",
                payload: {
                    type: "error",
                    text: "There was an error deleting your account. Please try again.",
                },
            });
        }
        setLoading(false);
        setModalOpen(false);
    };
    return (
        <>
            <ListItem disablePadding>
                <ListItemButton onClick={handleOpen} color="primary">
                    <ListItemIcon>
                        <Delete sx={{ color: "primary.onContainer" }} />
                    </ListItemIcon>
                    <ListItemText primary="Delete Account" />
                </ListItemButton>
            </ListItem>
            <ConfirmDialog
                loading={loading}
                open={modalOpen}
                onClose={() => setModalOpen(false)}
                title="Confirm Account Deletion"
                description="Are you sure you want to delete your account? This action is irreversible and will remove all your data. Please confirm you want to proceed. IMPORTANT: You will need to remove PathQuest from your Strava account settings to stop data syncing."
                onConfirm={onDelete}
                confirmText="Yes, Delete"
                onCancel={() => setModalOpen(false)}
                cancelText="Cancel"
            />
        </>
    );
};

export default DeleteButton;
