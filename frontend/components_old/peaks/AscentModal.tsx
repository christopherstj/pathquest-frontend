"use client";
import getAscentDetails from "@/actions/peaks/getAscentDetails";
import dayjs from "@/helpers/dayjs";
import Ascent from "@/typeDefs/Ascent";
import AscentDetail from "@/typeDefs/AscentDetail";
import PeakSummit from "@/typeDefs/PeakSummit";
import UnclimbedPeak from "@/typeDefs/UnclimbedPeak";
import {
    Box,
    Button,
    Checkbox,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Divider,
    FormControlLabel,
    IconButton,
    LinearProgress,
    Typography,
} from "@mui/material";
import React from "react";
import TextField from "../common/TextField";
import { Delete, Edit, Launch } from "@mui/icons-material";
import NotesDisplay from "./NotesDisplay";
import AscentTimestampDisplay from "./AscentTimestampDisplay";
import OtherAscents from "./OtherAscents";
import updateAscent from "@/actions/peaks/updateAscent";
import { useMessage } from "@/state_old/MessageContext";
import deleteAscent from "@/actions/peaks/deleteAscent";

type Props = {
    open: boolean;
    onClose: () => void;
    onComplete: (ascent: AscentDetail) => void;
    onDelete: (ascentId: string) => void;
    ascentId: string | null;
    redirectToShow?: "activity" | "peak";
    currentActivityId?: string;
};

const tz = dayjs.tz.guess();

const AscentModal = ({
    open,
    onClose,
    onComplete,
    onDelete,
    ascentId,
    redirectToShow = "peak",
    currentActivityId,
}: Props) => {
    const [, dispatch] = useMessage();
    const [peak, setPeak] = React.useState<PeakSummit | null>(null);
    const [ascent, setAscent] = React.useState<AscentDetail | null>(null);
    const [loading, setLoading] = React.useState(false);

    const getNewData = async (id: string | null) => {
        if (!id) return;
        setLoading(true);
        const { ascent, peak } = (await getAscentDetails(id)) ?? {
            peak: null,
            ascent: null,
        };

        setPeak(peak);
        setAscent(ascent);
        setLoading(false);
    };

    const timestamp = dayjs(ascent?.timestamp).tz(
        ascent?.timezone.split(" ").slice(-1)[0] ?? tz
    );

    const onAscentClick = (id: string) => {
        getNewData(id);
    };

    const onSubmit = async () => {
        if (!ascent) return;
        setLoading(true);
        const result = await updateAscent(ascent);
        if (result.success) {
            dispatch({
                type: "SET_MESSAGE",
                payload: {
                    text: "Ascent updated successfully",
                    type: "success",
                },
            });
            if (!currentActivityId || ascent.activityId === currentActivityId) {
                onComplete(ascent);
            }
        } else {
            dispatch({
                type: "SET_MESSAGE",
                payload: {
                    text: `Error updating ascent: ${result.error}`,
                    type: "error",
                },
            });
        }
        setLoading(false);
    };

    const handleDelete = async () => {
        if (!ascent) return;
        setLoading(true);
        const result = await deleteAscent(ascent.id);
        if (result.success) {
            dispatch({
                type: "SET_MESSAGE",
                payload: {
                    text: "Ascent deleted successfully",
                    type: "success",
                },
            });
            onDelete(ascent.id);
            onClose();
        } else {
            dispatch({
                type: "SET_MESSAGE",
                payload: {
                    text: `Error deleting ascent: ${result.error}`,
                    type: "error",
                },
            });
        }
        setLoading(false);
    };

    const handleClose = () => {
        setAscent(null);
        setPeak(null);
        onClose();
    };

    React.useEffect(() => {
        getNewData(ascentId);
    }, [ascentId]);

    console.log(ascent?.isPublic);

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
            {loading ? (
                <LinearProgress color="primary" />
            ) : (
                <DialogTitle
                    sx={{
                        display: "flex",
                        width: "100%",
                        alignItems: "flex-start",
                        pr: "8px",
                        gap: "8px",
                    }}
                    component={Box}
                >
                    <Box flex="1" display="flex" flexDirection="column">
                        <Typography variant="h6" color="primary">
                            Ascent of {peak?.Name}
                        </Typography>
                        <Typography
                            variant="caption"
                            color="primary.onContainerDim"
                        >
                            {timestamp.format("MMM D, YYYY h:mm A")}
                        </Typography>
                    </Box>
                    {currentActivityId !== ascent?.activityId && (
                        <Button
                            size="small"
                            variant="text"
                            color="primary"
                            href={`/app/activities/${ascent?.activityId}`}
                            sx={{ ml: "auto", flexBasis: "25%" }}
                        >
                            View Activity
                        </Button>
                    )}
                    {redirectToShow === "peak" && (
                        <Button
                            size="small"
                            color="primary"
                            href={`/app/peaks/${peak?.Id}`}
                            sx={{ ml: "auto", flexBasis: "25%" }}
                        >
                            View Peak
                        </Button>
                    )}
                    <IconButton
                        color="primary"
                        onClick={handleDelete}
                        sx={{ flexBasis: "48px" }}
                        size="small"
                    >
                        <Delete fontSize="small" />
                    </IconButton>
                </DialogTitle>
            )}
            <Divider
                sx={{
                    height: "1px",
                    backgroundColor: "primary.onContainerDim",
                    margin: "0px 8px",
                }}
            />
            {ascent && peak && (
                <DialogContent
                    sx={{
                        display: "flex",
                        flexWrap: "wrap",
                        gap: "8px",
                    }}
                >
                    <Box
                        flexBasis={{ xs: "100%", md: "calc(60% - 4px)" }}
                        display="flex"
                        flexDirection="column"
                        gap="12px"
                    >
                        <AscentTimestampDisplay
                            value={dayjs(ascent?.timestamp).tz(
                                ascent?.timezone.split(" ").slice(-1)[0] ?? tz
                            )}
                            onValueChange={(value) =>
                                setAscent({
                                    ...ascent,
                                    timestamp: value ? value.toISOString() : "",
                                })
                            }
                            useProfile
                            timezone={
                                ascent?.timezone.split(" ").slice(-1)[0] ?? tz
                            }
                            activityId={ascent.activityId}
                        />
                        <FormControlLabel
                            control={
                                <Checkbox
                                    color="primary"
                                    size="small"
                                    checked={ascent.isPublic}
                                    onChange={(e) =>
                                        setAscent({
                                            ...ascent,
                                            isPublic: e.target.checked,
                                        })
                                    }
                                />
                            }
                            label={
                                <Typography variant="caption" color="primary">
                                    Make summit report public?
                                </Typography>
                            }
                            color="primary"
                            sx={{
                                width: "100%",
                            }}
                        />
                        <NotesDisplay
                            value={ascent.notes}
                            onChange={(value) =>
                                setAscent({
                                    ...ascent,
                                    notes: value,
                                })
                            }
                        />
                    </Box>
                    <Box
                        flexBasis={{ xs: "100%", md: "calc(40% - 4px)" }}
                        display="flex"
                        flexDirection="column"
                        gap="8px"
                        // height="100%"
                    >
                        {peak.ascents && peak.ascents.length > 1 ? (
                            <>
                                <Typography
                                    variant="body1"
                                    color="primary"
                                    textAlign={{ xs: "center", md: "right" }}
                                >
                                    Your other ascents of {peak?.Name}:
                                </Typography>
                                <OtherAscents
                                    peak={peak}
                                    timezone={
                                        ascent?.timezone
                                            .split(" ")
                                            .slice(-1)[0] ?? tz
                                    }
                                    currentId={ascent.id}
                                    onAscentClick={onAscentClick}
                                />
                            </>
                        ) : (
                            <Typography
                                variant="body1"
                                color="primary.onContainerDim"
                                textAlign="center"
                            >
                                You have no other ascents of {peak?.Name}.
                            </Typography>
                        )}
                    </Box>
                </DialogContent>
            )}
            <DialogActions>
                <Button onClick={handleClose} variant="text">
                    Cancel
                </Button>
                <Button color="primary" onClick={onSubmit}>
                    Save Changes
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default AscentModal;
