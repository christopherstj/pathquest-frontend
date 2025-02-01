"use client";
import {
    Box,
    Button,
    Checkbox,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    FormControlLabel,
    LinearProgress,
    SxProps,
} from "@mui/material";
import React from "react";
import TextField, { textFieldStyles } from "../common/TextField";
import dayjs from "@/helpers/dayjs";
import { DateTimePicker } from "@mui/x-date-pickers";
import { datePickerStyles } from "../common/DatePicker";
import { ActivityStart } from "@/typeDefs/ActivityStart";
import UnclimbedPeak from "@/typeDefs/UnclimbedPeak";
import TimezoneSelect from "../common/TimezoneSelect";
import addManualPeakSummit from "@/actions/addManualPeakSummit";
import { useActivityDetail } from "@/state/ActivityDetailsContext";
import PeakSelectAutocomplete from "./PeakSelectAutocomplete";
import getActivityDetails from "@/actions/getActivityDetails";
import PeakSummit from "@/typeDefs/PeakSummit";
import CourseProfileTimeSelect from "./CourseProfileTimeSelect";
import { useUser } from "@/state/UserContext";

type Props = {
    open: boolean;
    onClose: () => void;
};

const tz = dayjs.tz.guess();

const ManualSummitModal = ({ open, onClose }: Props) => {
    const [{ activity, peakSummits, map }, setActivityDetailState] =
        useActivityDetail();
    const [{ user }] = useUser();

    const {
        id,
        timezone: activityTimezone,
        startTime,
        vertProfile,
        timeStream,
        distanceStream,
    } = activity;

    const initialTimezone = activityTimezone
        ? activityTimezone.split(" ").slice(-1)[0]
        : tz;

    const [timestamp, setTimestamp] = React.useState<dayjs.Dayjs | null>(
        dayjs(startTime).tz(initialTimezone)
    );
    const [notes, setNotes] = React.useState<string>("");
    const [selectedPeak, setSelectedPeak] = React.useState<UnclimbedPeak>();
    const [timezone, setTimezone] = React.useState<string>(initialTimezone);
    const [loading, setLoading] = React.useState(false);
    const [isPublic, setIsPublic] = React.useState(false);
    const [courseProfileOpen, setCourseProfileOpen] = React.useState(false);

    if (!user) return null;

    const { id: userId } = user;

    const onValueChange = (newValue: UnclimbedPeak | null) => {
        setSelectedPeak(newValue ?? undefined);
    };

    const handleClose = () => {
        setTimestamp(
            dayjs(startTime).tz(
                activityTimezone ? activityTimezone.split(" ").slice(-1)[0] : tz
            )
        );
        setNotes("");
        setSelectedPeak(undefined);
        setTimezone(
            activityTimezone ? activityTimezone.split(" ").slice(-1)[0] : tz
        );
        setIsPublic(false);
        setCourseProfileOpen(false);
        onClose();
    };

    const onSubmit = async () => {
        if (!timestamp || !selectedPeak) return;
        setLoading(true);
        try {
            await addManualPeakSummit(
                selectedPeak.Id,
                timestamp.toISOString().replace("T", " ").replace("Z", ""),
                notes,
                timezone,
                isPublic,
                id
            );
            const peakSummit = peakSummits.find(
                (p) => p.Id === selectedPeak.Id
            );
            const newPeakSummits = peakSummit
                ? peakSummits.map(
                      (p): PeakSummit =>
                          p.Id === selectedPeak.Id
                              ? {
                                    ...p,
                                    ascents: [
                                        ...p.ascents,
                                        {
                                            id: `${userId}-${p.Id}-${timestamp
                                                .toISOString()
                                                .replace("T", " ")
                                                .replace("Z", "")}`,
                                            timestamp: timestamp.toISOString(),
                                            activityId: id,
                                            notes,
                                        },
                                    ],
                                }
                              : p
                  )
                : [
                      ...peakSummits,
                      {
                          ...selectedPeak,
                          ascents: [
                              {
                                  id: `${userId}-${selectedPeak.Id}-${timestamp
                                      .toISOString()
                                      .replace("T", " ")
                                      .replace("Z", "")}`,
                                  timestamp: timestamp.toISOString(),
                                  activityId: id,
                                  notes,
                              },
                          ],
                      },
                  ];
            setActivityDetailState((state) => ({
                ...state,
                peakSummits: newPeakSummits,
            }));
            const source = map?.getSource("peaks") as mapboxgl.GeoJSONSource;
            if (source)
                source.setData({
                    type: "FeatureCollection",
                    features: newPeakSummits.map((peak) => ({
                        type: "Feature",
                        geometry: {
                            type: "Point",
                            coordinates: [peak.Long, peak.Lat],
                        },
                        properties: {
                            id: peak.Id,
                            ...peak,
                        },
                    })),
                });
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
                <Box
                    flexBasis="100%"
                    display="flex"
                    flexDirection="row-reverse"
                    flexWrap="wrap"
                    gap="12px"
                >
                    <PeakSelectAutocomplete
                        value={selectedPeak}
                        onValueChange={onValueChange}
                    />
                    <Box
                        sx={{
                            flexBasis: {
                                xs: "100%",
                                md: "calc(50% - 6px)",
                            },
                            mt: "8px",
                        }}
                    >
                        <DateTimePicker
                            timezone={timezone}
                            label="When did you summit?"
                            value={timestamp}
                            onChange={(newValue) => setTimestamp(newValue)}
                            slotProps={{
                                textField: {
                                    sx: {
                                        ...textFieldStyles("primary"),
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
                        {vertProfile && timeStream && distanceStream && (
                            <Button
                                color="primary"
                                size="small"
                                variant="text"
                                onClick={() =>
                                    setCourseProfileOpen(!courseProfileOpen)
                                }
                            >
                                Select from course profile
                            </Button>
                        )}
                    </Box>
                </Box>
                {courseProfileOpen &&
                    vertProfile &&
                    timeStream &&
                    distanceStream && (
                        <Box
                            sx={{
                                width: "100%",
                                flexBasis: "100%",
                                height: "140px",
                                mt: "12px",
                                position: "relative",
                                padding: "12px",
                            }}
                        >
                            <CourseProfileTimeSelect
                                value={timestamp}
                                onChange={(newValue) => setTimestamp(newValue)}
                                activity={activity}
                                peakSummits={peakSummits}
                            />
                        </Box>
                    )}
                <TimezoneSelect
                    value={timezone}
                    onChange={setTimezone}
                    disabled
                    helperText="Timezone is set by the activity"
                />
                <FormControlLabel
                    control={
                        <Checkbox
                            checked={isPublic}
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
                <Button onClick={handleClose} disabled={loading} variant="text">
                    Cancel
                </Button>
                <Button
                    onClick={onSubmit}
                    disabled={loading || !timestamp}
                    color="primary"
                >
                    Add Summit
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default ManualSummitModal;
