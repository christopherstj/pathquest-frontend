"use client";

import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Mountain,
    Star,
    Smile,
    Flame,
    Zap,
    Loader2,
    Check,
    X,
    Search,
    Link2,
    Unlink,
    Calendar,
    Clock,
    Globe,
    ChevronDown,
    Route,
} from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { useManualSummitStore } from "@/providers/ManualSummitProvider";
import addManualPeakSummit from "@/actions/peaks/addManualPeakSummit";
import searchNearestActivities from "@/actions/activities/searchNearestActivities";
import getActivityDetails from "@/actions/activities/getActivityDetails";
import searchPeaksAlongRoute, { PeakWithDistance } from "@/actions/peaks/searchPeaksAlongRoute";
import { useQueryClient } from "@tanstack/react-query";
import { Difficulty, ExperienceRating } from "@/typeDefs/Summit";
import { ActivityStart } from "@/typeDefs/ActivityStart";
import Activity from "@/typeDefs/Activity";
import dayjs from "@/helpers/dayjs";
import getTimezoneFromCoords from "@/actions/getTimezoneFromCoords";
import ElevationProfileSelector from "@/components/app/activities/ElevationProfileSelector";
import metersToFt from "@/helpers/metersToFt";

const DIFFICULTY_OPTIONS: {
    value: Difficulty;
    label: string;
    icon: React.ReactNode;
    color: string;
}[] = [
    {
        value: "easy",
        label: "Easy",
        icon: <Mountain className="w-4 h-4" />,
        color: "text-emerald-500 border-emerald-500/30 bg-emerald-500/10",
    },
    {
        value: "moderate",
        label: "Moderate",
        icon: <Mountain className="w-4 h-4" />,
        color: "text-amber-500 border-amber-500/30 bg-amber-500/10",
    },
    {
        value: "hard",
        label: "Hard",
        icon: <Mountain className="w-4 h-4" />,
        color: "text-orange-500 border-orange-500/30 bg-orange-500/10",
    },
    {
        value: "expert",
        label: "Expert",
        icon: <Mountain className="w-4 h-4" />,
        color: "text-red-500 border-red-500/30 bg-red-500/10",
    },
];

const EXPERIENCE_OPTIONS: {
    value: ExperienceRating;
    label: string;
    icon: React.ReactNode;
    color: string;
}[] = [
    {
        value: "tough",
        label: "Tough",
        icon: <Zap className="w-4 h-4" />,
        color: "text-blue-500 border-blue-500/30 bg-blue-500/10",
    },
    {
        value: "good",
        label: "Good",
        icon: <Smile className="w-4 h-4" />,
        color: "text-green-500 border-green-500/30 bg-green-500/10",
    },
    {
        value: "amazing",
        label: "Amazing",
        icon: <Star className="w-4 h-4" />,
        color: "text-yellow-500 border-yellow-500/30 bg-yellow-500/10",
    },
    {
        value: "epic",
        label: "Epic",
        icon: <Flame className="w-4 h-4" />,
        color: "text-purple-500 border-purple-500/30 bg-purple-500/10",
    },
];

// Common US timezones
const TIMEZONE_OPTIONS = [
    { value: "America/New_York", label: "Eastern (ET)" },
    { value: "America/Chicago", label: "Central (CT)" },
    { value: "America/Denver", label: "Mountain (MT)" },
    { value: "America/Phoenix", label: "Arizona (MST)" },
    { value: "America/Los_Angeles", label: "Pacific (PT)" },
    { value: "America/Anchorage", label: "Alaska (AKT)" },
    { value: "Pacific/Honolulu", label: "Hawaii (HST)" },
];

const AddManualSummitModal = () => {
    const isOpen = useManualSummitStore((state) => state.isOpen);
    const data = useManualSummitStore((state) => state.data);
    const closeManualSummit = useManualSummitStore(
        (state) => state.closeManualSummit
    );
    const queryClient = useQueryClient();

    // Form state
    const [summitDate, setSummitDate] = useState("");
    const [summitTime, setSummitTime] = useState("");
    const [timezone, setTimezone] = useState("");
    const [notes, setNotes] = useState("");
    const [difficulty, setDifficulty] = useState<Difficulty | undefined>(undefined);
    const [experience, setExperience] = useState<ExperienceRating | undefined>(undefined);
    const [isPublic, setIsPublic] = useState(true);

    // Activity linking state
    const [showActivitySearch, setShowActivitySearch] = useState(false);
    const [activitySearch, setActivitySearch] = useState("");
    const [nearbyActivities, setNearbyActivities] = useState<ActivityStart[]>([]);
    const [selectedActivityId, setSelectedActivityId] = useState<string | null>(null);
    const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
    const [loadingActivities, setLoadingActivities] = useState(false);
    const [loadingActivityDetails, setLoadingActivityDetails] = useState(false);

    // Peak search state (for activity-first flow)
    const [showPeakSearch, setShowPeakSearch] = useState(false);
    const [peakSearch, setPeakSearch] = useState("");
    const [nearbyPeaks, setNearbyPeaks] = useState<PeakWithDistance[]>([]);
    const [loadingPeaks, setLoadingPeaks] = useState(false);
    const [selectedPeak, setSelectedPeak] = useState<PeakWithDistance | null>(null);

    // Elevation profile selection
    const [profileSelectedTime, setProfileSelectedTime] = useState<dayjs.Dayjs | null>(null);

    // Submission state
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);

    // Reset form when modal opens
    useEffect(() => {
        const initializeForm = async () => {
            if (isOpen && data) {
                const now = dayjs();
                setSummitDate(now.format("YYYY-MM-DD"));
                setSummitTime(now.format("HH:mm"));
                
                // Get timezone from peak coords (server action)
                const peakTz = await getTimezoneFromCoords(data.peakCoords[1], data.peakCoords[0]);
                setTimezone(peakTz);
                
                setNotes("");
                setDifficulty(undefined);
                setExperience(undefined);
                setIsPublic(true);
                setShowActivitySearch(false);
                setActivitySearch("");
                setNearbyActivities([]);
                setProfileSelectedTime(null);
                setIsSubmitting(false);
                setShowSuccess(false);

                // If a preselected activity ID is provided, load it
                if (data.preselectedActivityId) {
                    setSelectedActivityId(data.preselectedActivityId);
                    // If we don't have a peak, show peak search
                    if (!data.peakId) {
                        setShowPeakSearch(true);
                    }
                } else {
                    setSelectedActivityId(null);
                    setSelectedActivity(null);
                }
                
                // Reset peak search state
                setPeakSearch("");
                setNearbyPeaks([]);
                setSelectedPeak(null);
                setShowPeakSearch(!data.peakId && !!data.preselectedActivityId);
            }
        };
        initializeForm();
    }, [isOpen, data]);

    // Search for nearby activities when modal opens
    useEffect(() => {
        if (isOpen && data && showActivitySearch) {
            const searchActivities = async () => {
                setLoadingActivities(true);
                const activities = await searchNearestActivities(
                    data.peakCoords[1],
                    data.peakCoords[0],
                    1,
                    activitySearch || undefined
                );
                setNearbyActivities(activities);
                setLoadingActivities(false);
            };
            
            const debounceTimer = setTimeout(searchActivities, 300);
            return () => clearTimeout(debounceTimer);
        }
    }, [isOpen, data, showActivitySearch, activitySearch]);

    // Fetch activity details when selected
    useEffect(() => {
        if (selectedActivityId) {
            const fetchActivityDetails = async () => {
                setLoadingActivityDetails(true);
                const details = await getActivityDetails(selectedActivityId);
                if (details?.activity) {
                    setSelectedActivity(details.activity);
                    // Inherit timezone from activity
                    if (details.activity.timezone) {
                        const activityTz = details.activity.timezone.split(" ").slice(-1)[0];
                        setTimezone(activityTz);
                    }
                    // Set initial date/time from activity start
                    const activityStart = dayjs(details.activity.start_time);
                    setSummitDate(activityStart.format("YYYY-MM-DD"));
                    setSummitTime(activityStart.format("HH:mm"));
                }
                setLoadingActivityDetails(false);
            };
            fetchActivityDetails();
        } else {
            setSelectedActivity(null);
        }
    }, [selectedActivityId]);

    // Update date/time when profile selection changes
    useEffect(() => {
        if (profileSelectedTime) {
            setSummitDate(profileSelectedTime.format("YYYY-MM-DD"));
            setSummitTime(profileSelectedTime.format("HH:mm"));
        }
    }, [profileSelectedTime]);

    // Search peaks along activity route
    useEffect(() => {
        if (isOpen && selectedActivityId && showPeakSearch) {
            const searchPeaks = async () => {
                setLoadingPeaks(true);
                const peaks = await searchPeaksAlongRoute(selectedActivityId, peakSearch || undefined);
                setNearbyPeaks(peaks);
                setLoadingPeaks(false);
            };
            
            const debounceTimer = setTimeout(searchPeaks, 300);
            return () => clearTimeout(debounceTimer);
        }
    }, [isOpen, selectedActivityId, showPeakSearch, peakSearch]);

    // Computed summit timestamp
    const summitTimestamp = useMemo(() => {
        if (!summitDate || !summitTime) return null;
        return dayjs.tz(`${summitDate} ${summitTime}`, timezone);
    }, [summitDate, summitTime, timezone]);

    const handleSelectActivity = (activity: ActivityStart) => {
        setSelectedActivityId(activity.id);
        setShowActivitySearch(false);
    };

    const handleSelectPeak = (peak: PeakWithDistance) => {
        setSelectedPeak(peak);
        setShowPeakSearch(false);
    };

    const handleUnlinkActivity = async () => {
        setSelectedActivityId(null);
        setSelectedActivity(null);
        setProfileSelectedTime(null);
        // Reset timezone to peak timezone
        if (data) {
            const peakTz = await getTimezoneFromCoords(data.peakCoords[1], data.peakCoords[0]);
            setTimezone(peakTz);
        }
    };

    const handleSubmit = async () => {
        if (!data || !summitTimestamp) return;

        // Use selectedPeak if available (activity-first flow), otherwise use data.peakId
        const peakIdToSubmit = selectedPeak?.id || data.peakId;
        
        if (!peakIdToSubmit) {
            // Need to select a peak first
            return;
        }

        setIsSubmitting(true);

        const result = await addManualPeakSummit({
            peakId: peakIdToSubmit,
            summitDate: summitTimestamp.toISOString(),
            notes: notes || undefined,
            timezone,
            isPublic,
            activityId: selectedActivityId || undefined,
            difficulty,
            experienceRating: experience,
        });

        if (result.success) {
            setShowSuccess(true);

            // Invalidate relevant queries
            queryClient.invalidateQueries({
                queryKey: ["peakDetails", peakIdToSubmit],
            });
            queryClient.invalidateQueries({
                queryKey: ["recentSummits"],
            });
            queryClient.invalidateQueries({
                queryKey: ["activityDetails", selectedActivityId],
            });

            setTimeout(() => {
                setShowSuccess(false);
                setIsSubmitting(false);
                closeManualSummit();
            }, 1500);
        } else {
            setIsSubmitting(false);
        }
    };

    const handleOpenChange = (open: boolean) => {
        if (!open) {
            closeManualSummit();
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleOpenChange}>
            <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
                <AnimatePresence mode="wait">
                    {showSuccess ? (
                        <SuccessContent peakName={selectedPeak?.name || data?.peakName || "Summit"} />
                    ) : (
                        <motion.div
                            key="form"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                        >
                            <DialogHeader className="text-center items-center">
                                <motion.div
                                    className="w-14 h-14 rounded-full bg-summited/10 flex items-center justify-center mb-2"
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{
                                        type: "spring",
                                        stiffness: 200,
                                        damping: 15,
                                    }}
                                >
                                    <Mountain className="w-7 h-7 text-summited" />
                                </motion.div>
                                <DialogTitle className="text-xl font-display">
                                    Log Summit
                                </DialogTitle>
                                <DialogDescription className="text-sm">
                                    {selectedPeak?.name || data?.peakName || "Select a peak"}
                                </DialogDescription>
                            </DialogHeader>

                            <div className="space-y-5 py-4">
                                {/* Peak Selection (when opened from activity page without a peak) */}
                                {data?.preselectedActivityId && !data?.peakId && (
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                            <Mountain className="w-4 h-4" />
                                            Select Peak
                                        </label>
                                        
                                        {selectedPeak ? (
                                            <div className="p-3 rounded-lg bg-summited/5 border border-summited/20">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-2">
                                                        <Mountain className="w-4 h-4 text-summited" />
                                                        <div>
                                                            <p className="text-sm font-medium">
                                                                {selectedPeak.name}
                                                            </p>
                                                            <p className="text-xs text-muted-foreground">
                                                                {selectedPeak.elevation && (
                                                                    <>{Math.round(metersToFt(selectedPeak.elevation)).toLocaleString()} ft</>
                                                                )}
                                                                {selectedPeak.distanceFromRoute !== undefined && (
                                                                    <> • {(selectedPeak.distanceFromRoute / 1000).toFixed(1)} km from route</>
                                                                )}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => {
                                                            setSelectedPeak(null);
                                                            setShowPeakSearch(true);
                                                        }}
                                                        className="text-muted-foreground hover:text-foreground"
                                                    >
                                                        Change
                                                    </Button>
                                                </div>
                                            </div>
                                        ) : showPeakSearch ? (
                                            <div className="space-y-2">
                                                <div className="relative">
                                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                                    <Input
                                                        placeholder="Search peaks along route..."
                                                        value={peakSearch}
                                                        onChange={(e) => setPeakSearch(e.target.value)}
                                                        className="pl-9"
                                                    />
                                                </div>
                                                
                                                <div className="max-h-[200px] overflow-y-auto rounded-lg border border-border/50">
                                                    {loadingPeaks ? (
                                                        <div className="flex items-center justify-center py-4">
                                                            <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                                                        </div>
                                                    ) : nearbyPeaks.length > 0 ? (
                                                        nearbyPeaks.map((peak) => (
                                                            <button
                                                                key={peak.id}
                                                                type="button"
                                                                onClick={() => handleSelectPeak(peak)}
                                                                className="w-full p-3 text-left hover:bg-muted/50 transition-colors border-b border-border/30 last:border-b-0"
                                                            >
                                                                <p className="text-sm font-medium truncate">
                                                                    {peak.name}
                                                                </p>
                                                                <p className="text-xs text-muted-foreground">
                                                                    {peak.elevation && (
                                                                        <>{Math.round(metersToFt(peak.elevation)).toLocaleString()} ft</>
                                                                    )}
                                                                    {peak.distanceFromRoute !== undefined && (
                                                                        <> • {(peak.distanceFromRoute / 1000).toFixed(1)} km from route</>
                                                                    )}
                                                                    {peak.state && (
                                                                        <> • {peak.state}</>
                                                                    )}
                                                                </p>
                                                            </button>
                                                        ))
                                                    ) : (
                                                        <p className="text-sm text-muted-foreground text-center py-4">
                                                            No peaks found along this route
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        ) : (
                                            <Button
                                                variant="outline"
                                                onClick={() => setShowPeakSearch(true)}
                                                className="w-full justify-start gap-2"
                                            >
                                                <Search className="w-4 h-4" />
                                                Search peaks along route
                                            </Button>
                                        )}
                                    </div>
                                )}

                                {/* Activity Linking */}
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                        <Link2 className="w-4 h-4" />
                                        Link to Activity (Optional)
                                    </label>
                                    
                                    {selectedActivity ? (
                                        <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <Route className="w-4 h-4 text-primary" />
                                                    <div>
                                                        <p className="text-sm font-medium">
                                                            {selectedActivity.title || "Untitled Activity"}
                                                        </p>
                                                        <p className="text-xs text-muted-foreground">
                                                            {dayjs(selectedActivity.start_time).format("MMM D, YYYY")}
                                                            {selectedActivity.distance && (
                                                                <> • {(selectedActivity.distance / 1609.344).toFixed(1)} mi</>
                                                            )}
                                                        </p>
                                                    </div>
                                                </div>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={handleUnlinkActivity}
                                                    className="text-muted-foreground hover:text-destructive"
                                                >
                                                    <Unlink className="w-4 h-4" />
                                                </Button>
                                            </div>
                                            
                                            {/* Elevation Profile Selector */}
                                            {selectedActivity.vert_profile && selectedActivity.vert_profile.length > 0 && (
                                                <div className="mt-3">
                                                    <p className="text-xs text-muted-foreground mb-2">
                                                        Click on the profile to select summit time:
                                                    </p>
                                                    <ElevationProfileSelector
                                                        activity={selectedActivity}
                                                        value={profileSelectedTime}
                                                        onChange={setProfileSelectedTime}
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    ) : showActivitySearch ? (
                                        <div className="space-y-2">
                                            <div className="relative">
                                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                                <Input
                                                    placeholder="Search your activities..."
                                                    value={activitySearch}
                                                    onChange={(e) => setActivitySearch(e.target.value)}
                                                    className="pl-9"
                                                />
                                            </div>
                                            
                                            <div className="max-h-[200px] overflow-y-auto rounded-lg border border-border/50">
                                                {loadingActivities ? (
                                                    <div className="flex items-center justify-center py-4">
                                                        <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                                                    </div>
                                                ) : nearbyActivities.length > 0 ? (
                                                    nearbyActivities.map((activity) => (
                                                        <button
                                                            key={activity.id}
                                                            type="button"
                                                            onClick={() => handleSelectActivity(activity)}
                                                            className="w-full p-3 text-left hover:bg-muted/50 transition-colors border-b border-border/30 last:border-b-0"
                                                        >
                                                            <p className="text-sm font-medium truncate">
                                                                {activity.title || "Untitled Activity"}
                                                            </p>
                                                            <p className="text-xs text-muted-foreground">
                                                                {dayjs(activity.start_time).format("MMM D, YYYY")}
                                                                {activity.distance && (
                                                                    <> • {(activity.distance / 1609.344).toFixed(1)} mi</>
                                                                )}
                                                                {activity.gain && (
                                                                    <> • {Math.round(metersToFt(activity.gain)).toLocaleString()} ft gain</>
                                                                )}
                                                            </p>
                                                        </button>
                                                    ))
                                                ) : (
                                                    <p className="text-sm text-muted-foreground text-center py-4">
                                                        No activities found nearby
                                                    </p>
                                                )}
                                            </div>
                                            
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => setShowActivitySearch(false)}
                                                className="w-full"
                                            >
                                                Cancel
                                            </Button>
                                        </div>
                                    ) : (
                                        <Button
                                            variant="outline"
                                            onClick={() => setShowActivitySearch(true)}
                                            className="w-full justify-start gap-2"
                                        >
                                            <Search className="w-4 h-4" />
                                            Search nearby activities
                                        </Button>
                                    )}
                                </div>

                                {/* Date & Time */}
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                            <Calendar className="w-4 h-4" />
                                            Date
                                        </label>
                                        <Input
                                            type="date"
                                            value={summitDate}
                                            onChange={(e) => setSummitDate(e.target.value)}
                                            disabled={isSubmitting}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                            <Clock className="w-4 h-4" />
                                            Time
                                        </label>
                                        <Input
                                            type="time"
                                            value={summitTime}
                                            onChange={(e) => setSummitTime(e.target.value)}
                                            disabled={isSubmitting}
                                        />
                                    </div>
                                </div>

                                {/* Timezone */}
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                        <Globe className="w-4 h-4" />
                                        Timezone
                                    </label>
                                    <div className="relative">
                                        <select
                                            value={timezone}
                                            onChange={(e) => setTimezone(e.target.value)}
                                            disabled={isSubmitting || !!selectedActivity}
                                            className="w-full h-10 px-3 pr-10 rounded-md border border-input bg-background text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 appearance-none"
                                        >
                                            {TIMEZONE_OPTIONS.map((tz) => (
                                                <option key={tz.value} value={tz.value}>
                                                    {tz.label}
                                                </option>
                                            ))}
                                            {/* Include detected timezone if not in list */}
                                            {!TIMEZONE_OPTIONS.find((tz) => tz.value === timezone) && (
                                                <option value={timezone}>{timezone}</option>
                                            )}
                                        </select>
                                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                                    </div>
                                    {selectedActivity && (
                                        <p className="text-xs text-muted-foreground">
                                            Inherited from linked activity
                                        </p>
                                    )}
                                </div>

                                {/* Notes */}
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-muted-foreground">
                                        Trip Notes
                                    </label>
                                    <Textarea
                                        placeholder="What made this summit special?"
                                        value={notes}
                                        onChange={(e) => setNotes(e.target.value)}
                                        className="min-h-[80px] resize-none"
                                        disabled={isSubmitting}
                                    />
                                </div>

                                {/* Difficulty */}
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-muted-foreground">
                                        How difficult was it?
                                    </label>
                                    <div className="grid grid-cols-4 gap-2">
                                        {DIFFICULTY_OPTIONS.map((option) => (
                                            <RatingButton
                                                key={option.value}
                                                option={option}
                                                isSelected={difficulty === option.value}
                                                onClick={() =>
                                                    setDifficulty(
                                                        difficulty === option.value ? undefined : option.value
                                                    )
                                                }
                                                disabled={isSubmitting}
                                            />
                                        ))}
                                    </div>
                                </div>

                                {/* Experience */}
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-muted-foreground">
                                        How was your experience?
                                    </label>
                                    <div className="grid grid-cols-4 gap-2">
                                        {EXPERIENCE_OPTIONS.map((option) => (
                                            <RatingButton
                                                key={option.value}
                                                option={option}
                                                isSelected={experience === option.value}
                                                onClick={() =>
                                                    setExperience(
                                                        experience === option.value ? undefined : option.value
                                                    )
                                                }
                                                disabled={isSubmitting}
                                            />
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-3 pt-2">
                                <Button
                                    variant="outline"
                                    onClick={() => closeManualSummit()}
                                    disabled={isSubmitting}
                                    className="flex-1"
                                >
                                    <X className="w-4 h-4 mr-2" />
                                    Cancel
                                </Button>
                                <Button
                                    onClick={handleSubmit}
                                    disabled={isSubmitting || !summitDate || !summitTime || (!data?.peakId && !selectedPeak)}
                                    className="flex-1 bg-green-600 hover:bg-green-700"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                            Saving...
                                        </>
                                    ) : (
                                        <>
                                            <Check className="w-4 h-4 mr-2" />
                                            Log Summit
                                        </>
                                    )}
                                </Button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </DialogContent>
        </Dialog>
    );
};

type RatingButtonProps = {
    option: {
        value: string;
        label: string;
        icon: React.ReactNode;
        color: string;
    };
    isSelected: boolean;
    onClick: () => void;
    disabled: boolean;
};

const RatingButton = ({ option, isSelected, onClick, disabled }: RatingButtonProps) => {
    return (
        <button
            type="button"
            onClick={onClick}
            disabled={disabled}
            className={`
                flex flex-col items-center gap-1 p-2 rounded-lg border-2 transition-all
                ${
                    isSelected
                        ? option.color
                        : "border-border/50 text-muted-foreground hover:border-border"
                }
                ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
            `}
            aria-label={`Select ${option.label}`}
            aria-pressed={isSelected}
            tabIndex={0}
        >
            {option.icon}
            <span className="text-xs font-medium">{option.label}</span>
        </button>
    );
};

type SuccessContentProps = {
    peakName: string;
};

const SuccessContent = ({ peakName }: SuccessContentProps) => {
    return (
        <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="py-8 text-center"
        >
            <motion.div
                className="w-16 h-16 rounded-full bg-summited/10 flex items-center justify-center mx-auto mb-4"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{
                    type: "spring",
                    stiffness: 200,
                    damping: 10,
                    delay: 0.1,
                }}
            >
                <Check className="w-8 h-8 text-summited" />
            </motion.div>
            <motion.h3
                className="text-xl font-display font-semibold mb-1"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
            >
                Summit Logged!
            </motion.h3>
            <motion.p
                className="text-muted-foreground"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
            >
                {peakName} has been added to your journal
            </motion.p>
        </motion.div>
    );
};

export default AddManualSummitModal;

