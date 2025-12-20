"use client";

import React from "react";
import { Download, Mountain, Clock, CheckCircle, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

export interface ImportStatus {
    totalActivities: number;
    processedActivities: number;
    pendingActivities: number;
    skippedActivities: number;
    summitsFound: number;
    percentComplete: number;
    estimatedHoursRemaining: number | null;
    status: "not_started" | "processing" | "complete";
    message: string;
}

interface ImportProgressCardProps {
    status: ImportStatus | null;
    onDismiss?: () => void;
    className?: string;
}

const ImportProgressCard = ({ status, onDismiss, className }: ImportProgressCardProps) => {
    // Don't show if no status, complete, or not started
    if (!status || status.status === "complete" || status.status === "not_started") {
        return null;
    }

    const { 
        totalActivities, 
        processedActivities, 
        pendingActivities,
        summitsFound, 
        percentComplete, 
        estimatedHoursRemaining,
        message 
    } = status;

    // Format ETA for display
    const formatEta = (hours: number | null): string => {
        if (hours === null) return "";
        if (hours < 1) return "Less than an hour";
        if (hours < 24) {
            const h = Math.ceil(hours);
            return `~${h} hour${h !== 1 ? "s" : ""}`;
        }
        const days = Math.ceil(hours / 24);
        return `~${days} day${days !== 1 ? "s" : ""}`;
    };

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className={cn(
                    "relative p-4 rounded-xl",
                    "bg-gradient-to-br from-primary/10 via-card to-secondary/10",
                    "border border-primary/20",
                    className
                )}
            >
                {/* Dismiss button */}
                {onDismiss && (
                    <button
                        onClick={onDismiss}
                        className="absolute top-2 right-2 p-1 rounded-full hover:bg-muted/50 transition-colors text-muted-foreground hover:text-foreground"
                        aria-label="Dismiss"
                    >
                        <X className="w-4 h-4" />
                    </button>
                )}

                {/* Header */}
                <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                        <Download className="w-4 h-4 text-primary animate-pulse" />
                    </div>
                    <div>
                        <h3 className="text-sm font-semibold text-foreground">
                            Importing Your Strava History
                        </h3>
                        <p className="text-xs text-muted-foreground">
                            Your biggest adventures are processed first
                        </p>
                    </div>
                </div>

                {/* Progress bar */}
                <div className="mb-3">
                    <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-muted-foreground">
                            {processedActivities.toLocaleString()} of {totalActivities.toLocaleString()} activities
                        </span>
                        <span className="font-mono text-foreground font-medium">
                            {percentComplete}%
                        </span>
                    </div>
                    <div className="relative h-2.5 rounded-full bg-muted overflow-hidden">
                        <motion.div
                            className="absolute inset-y-0 left-0 bg-gradient-to-r from-primary to-secondary rounded-full"
                            initial={{ width: 0 }}
                            animate={{ width: `${percentComplete}%` }}
                            transition={{ duration: 0.5, ease: "easeOut" }}
                        />
                        {/* Animated shimmer effect */}
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
                    </div>
                </div>

                {/* Stats row */}
                <div className="grid grid-cols-2 gap-3 mb-3">
                    {/* Summits found */}
                    <div className="flex items-center gap-2 p-2 rounded-lg bg-card/50">
                        <Mountain className="w-4 h-4 text-secondary" />
                        <div>
                            <p className="text-lg font-bold text-foreground leading-none">
                                {summitsFound}
                            </p>
                            <p className="text-xs text-muted-foreground">
                                summit{summitsFound !== 1 ? "s" : ""} found
                            </p>
                        </div>
                    </div>

                    {/* ETA */}
                    <div className="flex items-center gap-2 p-2 rounded-lg bg-card/50">
                        <Clock className="w-4 h-4 text-primary" />
                        <div>
                            <p className="text-sm font-medium text-foreground leading-tight">
                                {formatEta(estimatedHoursRemaining)}
                            </p>
                            <p className="text-xs text-muted-foreground">
                                remaining
                            </p>
                        </div>
                    </div>
                </div>

                {/* Message */}
                <p className="text-xs text-muted-foreground text-center italic">
                    {message}
                </p>
            </motion.div>
        </AnimatePresence>
    );
};

export default ImportProgressCard;

