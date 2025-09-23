"use client";
import addChallengeFavorite from "@/actions/challenges/addChallengeFavorite";
import deleteChallengeFavorite from "@/actions/challenges/deleteChallengeFavorite";
import { useChallengeDetail } from "@/state/ChallengeDetailContext";
import { useMessage } from "@/state/MessageContext";
import { Star, StarBorder } from "@mui/icons-material";
import { Button } from "@mui/material";
import React from "react";

const ChallengeSubscribeButton = () => {
    const [{ challenge, ...peaksDetailState }, setChallengeDetail] =
        useChallengeDetail();
    const [, dispatch] = useMessage();

    const onClick = async () => {
        if (challenge.isFavorited) {
            setChallengeDetail({
                ...peaksDetailState,
                challenge: { ...challenge, isFavorited: false },
            });

            const res = await deleteChallengeFavorite(challenge.id);

            if (!res.success) {
                console.error(
                    "Failed to unsubscribe from challenge:",
                    res.error
                );
                dispatch({
                    type: "SET_MESSAGE",
                    payload: {
                        type: "error",
                        text: "Error unsubscribing from challenge",
                    },
                });
                setChallengeDetail({
                    ...peaksDetailState,
                    challenge: { ...challenge, isFavorited: true },
                });
            }
        } else {
            setChallengeDetail({
                ...peaksDetailState,
                challenge: { ...challenge, isFavorited: true },
            });

            const res = await addChallengeFavorite(challenge.id);

            if (!res.success) {
                console.error("Failed to subscribe to challenge:", res.error);
                dispatch({
                    type: "SET_MESSAGE",
                    payload: {
                        type: "error",
                        text: "Error subscribing to challenge",
                    },
                });
                setChallengeDetail({
                    ...peaksDetailState,
                    challenge: { ...challenge, isFavorited: false },
                });
            }
        }
    };

    return (
        <Button
            color="primary"
            sx={{ ml: "auto" }}
            onClick={onClick}
            variant="text"
            startIcon={
                challenge.isFavorited ? (
                    <Star
                        sx={{
                            color: "tertiary.onContainerDim",
                        }}
                    />
                ) : (
                    <StarBorder
                        sx={{
                            color: "primary.onContainerDim",
                        }}
                    />
                )
            }
        >
            {challenge.isFavorited ? "Accepted" : "Accept Challenge"}
        </Button>
    );
};

export default ChallengeSubscribeButton;
