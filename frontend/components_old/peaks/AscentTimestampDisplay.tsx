"use client";
import dayjs from "@/helpers/dayjs";
import { DateTimePicker } from "@mui/x-date-pickers";
import React from "react";
import { textFieldStyles } from "../common/TextField";
import { datePickerStyles } from "../common/DatePicker";
import { Box, Button, IconButton, Typography } from "@mui/material";
import CourseProfileTimeSelect from "../activities/CourseProfileTimeSelect";
import { Edit } from "@mui/icons-material";
import Activity from "@/typeDefs/Activity";
import PeakSummit from "@/typeDefs/PeakSummit";
import getActivityDetails from "@/actions/activities/getActivityDetails";

type Props = {
    value: dayjs.Dayjs | null;
    onValueChange: (value: dayjs.Dayjs | null) => void;
    useProfile: boolean;
    timezone: string;
    activityId?: string;
};

const AscentTimestampDisplay = ({
    value,
    onValueChange,
    timezone,
    activityId,
    useProfile,
}: Props) => {
    const [isEditing, setIsEditing] = React.useState(false);
    const [profileOpen, setProfileOpen] = React.useState(false);
    const [activity, setActivity] = React.useState<Activity | null>(null);
    const [peakSummits, setPeakSummits] = React.useState<PeakSummit[]>([]);

    const getNewData = async () => {
        if (!activityId || !useProfile) return;
        const { activity, peakSummits } = (await getActivityDetails(
            activityId
        )) ?? {
            activity: null,
            peakSummits: [],
        };
        setActivity(activity);
        setPeakSummits(peakSummits);
    };

    React.useEffect(() => {
        getNewData();
    }, [activityId, useProfile]);

    return isEditing ? (
        <>
            <DateTimePicker
                timezone={timezone}
                label="When did you summit?"
                value={value}
                onChange={(newValue) => onValueChange(newValue)}
                slotProps={{
                    textField: {
                        sx: {
                            ...textFieldStyles("primary"),
                            mt: "12px",
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
            {useProfile && (
                <Button
                    color="primary"
                    size="small"
                    variant="text"
                    onClick={() => setProfileOpen(!profileOpen)}
                >
                    Select from course profile
                </Button>
            )}
            {profileOpen && activity && peakSummits && (
                <Box
                    sx={{
                        width: "100%",
                        height: "120px",
                        mt: "12px",
                        position: "relative",
                        padding: "12px",
                    }}
                >
                    <CourseProfileTimeSelect
                        value={value}
                        onChange={(newValue) => onValueChange(newValue)}
                        activity={activity}
                        peakSummits={peakSummits}
                    />
                </Box>
            )}
        </>
    ) : (
        <Box width="100%" display="flex" gap="8px" alignItems="center">
            <Typography variant="body1" color="primary.onContainer">
                Ascent Time:
            </Typography>
            <Typography
                variant="body1"
                color="primary.onContainerDim"
                onClick={() => setIsEditing(true)}
                sx={{ cursor: "pointer" }}
            >
                {value ? dayjs(value).tz(timezone).format("h:mm A") : "Not set"}
            </Typography>
            <IconButton
                color="primary"
                onClick={() => setIsEditing(true)}
                size="small"
            >
                <Edit fontSize="small" />
            </IconButton>
        </Box>
    );
};

export default AscentTimestampDisplay;
