"use client";
import {
    Autocomplete,
    Avatar,
    Button,
    Checkbox,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    FormControlLabel,
    LinearProgress,
    ListItem,
    ListItemAvatar,
    ListItemText,
    SxProps,
    Typography,
} from "@mui/material";
import React from "react";
import TextField, { textFieldStyles } from "../common/TextField";
import dayjs from "@/helpers/dayjs";
import { DateTimePicker } from "@mui/x-date-pickers";
import { datePickerStyles } from "../common/DatePicker";
import { ActivityStart } from "@/typeDefs/ActivityStart";
import searchNearestActivities from "@/actions/searchNearestActivities";
import UnclimbedPeak from "@/typeDefs/UnclimbedPeak";
import { DirectionsBike, DirectionsRun } from "@mui/icons-material";
import { useUser } from "@/state/UserContext";
import getDistanceString from "@/helpers/getDistanceString";
import getVerticalGainString from "@/helpers/getVerticalGainString";
import TimezoneSelect from "./TimezoneSelect";
import ActivitySelectAutocomplete from "./ActivitySelectAutocomplete";
import addManualPeakSummit from "@/actions/addManualPeakSummit";

const buttonStyles: SxProps = {
    borderRadius: "24px",
    backgroundColor: "transparent",
    borderColor: "primary.onContainer",
    color: "primary.onContainer",
    "&:hover": {
        backgroundColor: "primary.containerDim",
    },
};

type Props = {
    open: boolean;
    onClose: () => void;
    peak: UnclimbedPeak;
};

const tz = dayjs.tz.guess();

const ManualSummitModal = ({ open, onClose, peak }: Props) => {
    const [timestamp, setTimestamp] = React.useState<dayjs.Dayjs | null>(null);
    const [notes, setNotes] = React.useState<string>("");
    const [selectedActivity, setSelectedActivity] =
        React.useState<ActivityStart>();
    const [timezone, setTimezone] = React.useState<string>(tz);
    const [loading, setLoading] = React.useState(false);
    const [isPublic, setIsPublic] = React.useState(false);

    const onValueChange = (newValue: ActivityStart | null) => {
        setSelectedActivity(newValue ?? undefined);
        if (timestamp === null) {
            setTimestamp(dayjs(newValue?.startTime ?? null));
        }
        if (timezone === tz) {
            setTimezone(
                newValue?.timezone
                    ? newValue.timezone.split(" ").slice(-1)[0]
                    : tz
            );
        }
    };

    const handleClose = () => {
        setTimestamp(null);
        setNotes("");
        setSelectedActivity(undefined);
        setTimezone(tz);
        setIsPublic(false);
        onClose();
    };

    const onSubmit = async () => {
        if (!timestamp) return;
        setLoading(true);
        try {
            await addManualPeakSummit(
                peak.Id,
                timestamp.toISOString().replace("T", " ").replace("Z", ""),
                notes,
                timezone,
                isPublic,
                selectedActivity?.id
            );
            handleClose();
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onClose={onClose}>
            {loading && <LinearProgress />}
            <DialogTitle>Summit this peak already?</DialogTitle>
            <DialogContent
                sx={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: "12px",
                    paddingTop: "12px",
                }}
            >
                <DateTimePicker
                    label="When did you summit?"
                    value={timestamp}
                    onChange={(newValue) => setTimestamp(newValue)}
                    slotProps={{
                        textField: {
                            sx: {
                                ...textFieldStyles("primary"),
                                flexBasis: {
                                    xs: "100%",
                                    md: "calc(50% - 6px)",
                                },
                                mt: "8px",
                            },
                            fullWidth: true,
                        },
                        desktopPaper: {
                            sx: {
                                backgroundColor: "primary.container",
                                borderRadius: "12px",
                            },
                        },
                        mobilePaper: {
                            sx: {
                                backgroundColor: "primary.container",
                                borderRadius: "12px",
                            },
                        },
                        ...datePickerStyles("primary"),
                    }}
                />
                <ActivitySelectAutocomplete
                    value={selectedActivity}
                    onValueChange={onValueChange}
                    peak={peak}
                />
                <TimezoneSelect
                    value={timezone}
                    onChange={setTimezone}
                    disabled={!!selectedActivity}
                />
                <FormControlLabel
                    control={
                        <Checkbox
                            value={isPublic}
                            onChange={(e) => setIsPublic(e.target.checked)}
                            color="primary"
                        />
                    }
                    label="Make summit report public?"
                    color="primary"
                    sx={{
                        flexBasis: {
                            xs: "100%",
                            md: "calc(50% - 12px)",
                        },
                    }}
                />
                <TextField
                    label="Notes"
                    value={notes}
                    color="primary"
                    onChange={(e) => setNotes(e.target.value)}
                    multiline
                    rows={4}
                    sx={{ borderRadius: "12px", flexBasis: "100%" }}
                />
            </DialogContent>
            <DialogActions>
                <Button
                    onClick={handleClose}
                    sx={buttonStyles}
                    disabled={loading}
                >
                    Cancel
                </Button>
                <Button
                    variant="outlined"
                    onClick={onSubmit}
                    sx={buttonStyles}
                    disabled={loading || !timestamp}
                >
                    Add Summit
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default ManualSummitModal;
