import updateChallengeFavorite from "@/actions/updateChallengeFavorite";
import { useChallengeDetail } from "@/state/ChallengeDetailContext";
import { useMessage } from "@/state/MessageContext";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import {
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Tooltip,
} from "@mui/material";
import React from "react";

type Props = {};

const ChallengePrivacyButton = (props: Props) => {
    const [{ challenge, ...peaksDetailState }, setChallengeDetail] =
        useChallengeDetail();
    const [, dispatch] = useMessage();

    const handlePrivacyToggle = async () => {
        setChallengeDetail({
            ...peaksDetailState,
            challenge: {
                ...challenge,
                isPublic: !challenge.isPublic,
            },
        });
        const res = await updateChallengeFavorite(
            challenge.id,
            !challenge.isPublic
        );

        if (!res.success) {
            console.error("Failed to update challenge privacy:", res.error);
            dispatch({
                type: "SET_MESSAGE",
                payload: {
                    type: "error",
                    text: "Error updating challenge privacy",
                },
            });
            setChallengeDetail({
                ...peaksDetailState,
                challenge: {
                    ...challenge,
                    isPublic: !challenge.isPublic, // revert the change
                },
            });
            return;
        }
    };

    const innerDisplay = (
        <ListItemButton
            onClick={handlePrivacyToggle}
            disabled={!challenge.isFavorited}
        >
            <ListItemIcon>
                {challenge.isPublic ? <Visibility /> : <VisibilityOff />}
            </ListItemIcon>
            <ListItemText primary={challenge.isPublic ? "Public" : "Private"} />
        </ListItemButton>
    );

    return challenge.isFavorited ? (
        innerDisplay
    ) : (
        <Tooltip title="You must subscribe to the challenge to change its privacy">
            {innerDisplay}
        </Tooltip>
    );
};

export default ChallengePrivacyButton;
