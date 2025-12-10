"use client";

import React, { useState, useEffect } from "react";
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
import { useSummitReportStore } from "@/providers/SummitReportProvider";
import updateAscent from "@/actions/peaks/updateAscent";
import { useQueryClient } from "@tanstack/react-query";
import { Difficulty, ExperienceRating } from "@/typeDefs/Summit";

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

const PLACEHOLDER_PROMPTS = [
    "What made this summit special?",
    "How was the view from the top?",
    "Any memorable moments to share?",
    "What was the highlight of your climb?",
    "Describe the trail conditions...",
];

const SummitReportModal = () => {
    const isOpen = useSummitReportStore((state) => state.isOpen);
    const data = useSummitReportStore((state) => state.data);
    const closeSummitReport = useSummitReportStore(
        (state) => state.closeSummitReport
    );
    const queryClient = useQueryClient();

    const [notes, setNotes] = useState("");
    const [difficulty, setDifficulty] = useState<Difficulty | undefined>(
        undefined
    );
    const [experience, setExperience] = useState<ExperienceRating | undefined>(
        undefined
    );
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [placeholder, setPlaceholder] = useState(PLACEHOLDER_PROMPTS[0]);

    // Reset form when modal opens with new data
    useEffect(() => {
        if (data?.summit) {
            setNotes(data.summit.notes || "");
            setDifficulty(data.summit.difficulty);
            setExperience(data.summit.experience_rating);
            setIsSubmitting(false);
            setShowSuccess(false);
            // Pick a random placeholder
            setPlaceholder(
                PLACEHOLDER_PROMPTS[
                    Math.floor(Math.random() * PLACEHOLDER_PROMPTS.length)
                ]
            );
        }
    }, [data]);

    const handleSubmit = async () => {
        if (!data?.summit || !data?.peakId) return;

        setIsSubmitting(true);

        const result = await updateAscent({
            id: data.summit.id,
            timestamp: data.summit.timestamp,
            activity_id: data.summit.activity_id,
            peak_id: data.peakId,
            notes: notes || "",
            is_public: data.summit.is_public || false,
            timezone: data.summit.timezone || "",
            difficulty,
            experience_rating: experience,
        });

        if (result.success) {
            setShowSuccess(true);

            // Invalidate relevant queries to refresh data
            queryClient.invalidateQueries({
                queryKey: ["peakDetails", data.peakId],
            });
            queryClient.invalidateQueries({
                queryKey: ["peakSummits", data.peakId],
            });
            queryClient.invalidateQueries({
                queryKey: ["recentSummits"],
            });

            // Close modal after brief celebration
            setTimeout(() => {
                setShowSuccess(false);
                setIsSubmitting(false);
                closeSummitReport();
            }, 1500);
        } else {
            setIsSubmitting(false);
        }
    };

    const handleOpenChange = (open: boolean) => {
        if (!open) {
            closeSummitReport();
        }
    };

    const handleClose = () => {
        closeSummitReport();
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleOpenChange}>
            <DialogContent className="sm:max-w-lg">
                <AnimatePresence mode="wait">
                    {showSuccess ? (
                        <SuccessContent peakName={data?.peakName || "Summit"} />
                    ) : (
                        <motion.div
                            key="form"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                        >
                            <DialogHeader className="text-center items-center">
                                <motion.div
                                    className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mb-2"
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{
                                        type: "spring",
                                        stiffness: 200,
                                        damping: 15,
                                    }}
                                >
                                    <Mountain className="w-7 h-7 text-primary" />
                                </motion.div>
                                <DialogTitle className="text-xl font-display">
                                    {data?.peakName || "Summit"}
                                </DialogTitle>
                                <DialogDescription className="text-sm">
                                    Share your experience from this summit
                                </DialogDescription>
                            </DialogHeader>

                            <div className="space-y-5 py-4">
                                {/* Notes */}
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-muted-foreground">
                                        Trip Notes
                                    </label>
                                    <Textarea
                                        placeholder={placeholder}
                                        value={notes}
                                        onChange={(e) =>
                                            setNotes(e.target.value)
                                        }
                                        className="min-h-[100px] resize-none"
                                        disabled={isSubmitting}
                                        aria-label="Trip notes"
                                    />
                                </div>

                                {/* Difficulty */}
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-muted-foreground">
                                        How difficult was it?
                                    </label>
                                    <div className="grid grid-cols-4 gap-2">
                                        {DIFFICULTY_OPTIONS.map((option) => (
                                            <DifficultyButton
                                                key={option.value}
                                                option={option}
                                                isSelected={
                                                    difficulty === option.value
                                                }
                                                onClick={() =>
                                                    setDifficulty(
                                                        difficulty ===
                                                            option.value
                                                            ? undefined
                                                            : option.value
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
                                            <ExperienceButton
                                                key={option.value}
                                                option={option}
                                                isSelected={
                                                    experience === option.value
                                                }
                                                onClick={() =>
                                                    setExperience(
                                                        experience ===
                                                            option.value
                                                            ? undefined
                                                            : option.value
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
                                    onClick={handleClose}
                                    disabled={isSubmitting}
                                    className="flex-1"
                                    aria-label="Cancel"
                                >
                                    <X className="w-4 h-4 mr-2" />
                                    Cancel
                                </Button>
                                <Button
                                    onClick={handleSubmit}
                                    disabled={isSubmitting}
                                    className="flex-1 bg-primary hover:bg-primary/90"
                                    aria-label="Save summit report"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                            Saving...
                                        </>
                                    ) : (
                                        <>
                                            <Check className="w-4 h-4 mr-2" />
                                            Save Report
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

type DifficultyButtonProps = {
    option: (typeof DIFFICULTY_OPTIONS)[number];
    isSelected: boolean;
    onClick: () => void;
    disabled: boolean;
};

const DifficultyButton = ({
    option,
    isSelected,
    onClick,
    disabled,
}: DifficultyButtonProps) => {
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
            aria-label={`Select ${option.label} difficulty`}
            aria-pressed={isSelected}
            tabIndex={0}
        >
            {option.icon}
            <span className="text-xs font-medium">{option.label}</span>
        </button>
    );
};

type ExperienceButtonProps = {
    option: (typeof EXPERIENCE_OPTIONS)[number];
    isSelected: boolean;
    onClick: () => void;
    disabled: boolean;
};

const ExperienceButton = ({
    option,
    isSelected,
    onClick,
    disabled,
}: ExperienceButtonProps) => {
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
            aria-label={`Select ${option.label} experience`}
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
                className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-4"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{
                    type: "spring",
                    stiffness: 200,
                    damping: 10,
                    delay: 0.1,
                }}
            >
                <Check className="w-8 h-8 text-green-500" />
            </motion.div>
            <motion.h3
                className="text-xl font-display font-semibold mb-1"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
            >
                Report Saved!
            </motion.h3>
            <motion.p
                className="text-muted-foreground"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
            >
                Your {peakName} summit is logged
            </motion.p>
        </motion.div>
    );
};

export default SummitReportModal;

