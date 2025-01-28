import { MoreVert } from "@mui/icons-material";
import { IconButton, List, Popover } from "@mui/material";
import React from "react";
import DeleteActivityButton from "./DeleteActivityButton";
import ReprocessActivityButton from "./ReprocessActivityButton";
import { ActivityDetailState } from "@/state/ActivityDetailsContext";

type Props = {
    activityId: string;
    isReprocessing?: boolean;
    setActivityDetailState: React.Dispatch<
        React.SetStateAction<ActivityDetailState>
    >;
};

const ActivityMenu = ({
    activityId,
    isReprocessing,
    setActivityDetailState,
}: Props) => {
    const [anchorEl, setAnchorEl] = React.useState<HTMLButtonElement | null>(
        null
    );

    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const onSuccess = () => {
        setActivityDetailState((state) => ({
            ...state,
            activity: {
                ...state.activity,
                reprocessing: true,
            },
        }));
    };

    const open = Boolean(anchorEl);
    const id = open ? "simple-popover" : undefined;

    return (
        <>
            <IconButton color="primary" onClick={handleClick}>
                <MoreVert />
            </IconButton>
            <Popover
                id={id}
                open={open}
                anchorEl={anchorEl}
                onClose={handleClose}
                anchorOrigin={{
                    vertical: "bottom",
                    horizontal: "right",
                }}
                transformOrigin={{
                    vertical: "top",
                    horizontal: "right",
                }}
            >
                <List>
                    <DeleteActivityButton activityId={activityId} />
                    <ReprocessActivityButton
                        activityId={activityId}
                        disabled={isReprocessing}
                        onSuccess={onSuccess}
                    />
                </List>
            </Popover>
        </>
    );
};

export default ActivityMenu;
