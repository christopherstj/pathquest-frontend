"use client";

import React from "react";
import { motion } from "framer-motion";
import { Trophy, ChevronRight, CheckCircle } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import getUserProfile from "@/actions/users/getUserProfile";
import { useIsAuthenticated } from "@/hooks/useRequireAuth";
import Link from "next/link";
import ChallengeProgress from "@/typeDefs/ChallengeProgress";

interface ProfileChallengesProps {
    userId: string;
}

interface ChallengeCardProps {
    challenge: ChallengeProgress;
    isCompleted: boolean;
    userId: string;
    isOwner: boolean;
}

const ChallengeCard = ({ challenge, isCompleted, userId, isOwner }: ChallengeCardProps) => {
    const progress = challenge.total > 0
        ? Math.round((challenge.completed / challenge.total) * 100)
        : 0;

    // Link to user challenge page when viewing someone else's profile
    const href = isOwner 
        ? `/challenges/${challenge.id}` 
        : `/users/${userId}/challenges/${challenge.id}`;

    return (
        <Link
            href={href}
            className={`block p-3 rounded-lg border transition-colors group ${
                isCompleted
                    ? "bg-summited/5 border-summited/30 hover:border-summited/50"
                    : "bg-card border-border/70 hover:border-primary/50 hover:bg-card/80"
            }`}
        >
            <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                    {isCompleted ? (
                        <CheckCircle className="w-4 h-4 text-summited" />
                    ) : (
                        <Trophy className="w-4 h-4 text-secondary" />
                    )}
                    <span className={`text-sm font-medium transition-colors ${
                        isCompleted
                            ? "text-foreground group-hover:text-summited"
                            : "text-foreground group-hover:text-primary"
                    }`}>
                        {challenge.name}
                    </span>
                </div>
                <div className="flex items-center gap-2">
                    <span className={`text-xs ${isCompleted ? "text-summited" : "text-muted-foreground"}`}>
                        {challenge.completed}/{challenge.total}
                    </span>
                    <ChevronRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
            </div>
            <div className={`h-1.5 rounded-full overflow-hidden ${
                isCompleted ? "bg-summited/20" : "bg-muted"
            }`}>
                <div
                    className={`h-full rounded-full transition-all ${
                        isCompleted
                            ? "bg-summited"
                            : "bg-gradient-to-r from-secondary to-primary"
                    }`}
                    style={{ width: `${progress}%` }}
                />
            </div>
        </Link>
    );
};

const ProfileChallenges = ({ userId }: ProfileChallengesProps) => {
    const { user: currentUser } = useIsAuthenticated();
    const isOwner = Boolean(currentUser?.id && String(currentUser.id) === String(userId));

    const { data, isLoading } = useQuery({
        queryKey: ["userProfile", userId],
        queryFn: async () => {
            const res = await getUserProfile(userId);
            return res;
        },
    });

    const profile = data?.success ? data.data : null;
    
    // Split challenges into in-progress and completed
    const { inProgress, completed } = React.useMemo(() => {
        const challenges = profile?.acceptedChallenges ?? [];
        
        const inProgressList: ChallengeProgress[] = [];
        const completedList: ChallengeProgress[] = [];
        
        challenges.forEach((challenge) => {
            // Use is_completed flag if available, otherwise calculate
            const isComplete = challenge.is_completed ?? (challenge.completed >= challenge.total);
            if (isComplete) {
                completedList.push(challenge);
            } else {
                inProgressList.push(challenge);
            }
        });
        
        // Sort in-progress by progress percentage descending
        inProgressList.sort((a, b) => {
            const progressA = a.total > 0 ? (a.completed / a.total) : 0;
            const progressB = b.total > 0 ? (b.completed / b.total) : 0;
            return progressB - progressA;
        });
        
        // Sort completed by name
        completedList.sort((a, b) => a.name.localeCompare(b.name));
        
        return { inProgress: inProgressList, completed: completedList };
    }, [profile?.acceptedChallenges]);

    const totalChallenges = inProgress.length + completed.length;

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-10">
                <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (totalChallenges === 0) {
        return (
            <div className="text-center py-10 text-muted-foreground">
                <Trophy className="w-10 h-10 mx-auto mb-3 opacity-50" />
                <p className="text-sm font-medium">No challenges yet</p>
                <p className="text-xs mt-1">
                    Challenges this user has accepted will appear here
                </p>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full">
            <div className="flex-1 overflow-y-auto px-4 pb-4 custom-scrollbar">
                <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    transition={{ duration: 0.15 }}
                    className="space-y-4"
                >
                    {/* In Progress Section */}
                    {inProgress.length > 0 && (
                        <div className="space-y-2">
                            <div className="flex items-center gap-2 pb-2 border-b border-border/60">
                                <Trophy className="w-4 h-4 text-secondary" />
                                <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                                    In Progress ({inProgress.length})
                                </h2>
                            </div>
                            <div className="space-y-2">
                                {inProgress.map((challenge) => (
                                    <ChallengeCard
                                        key={challenge.id}
                                        challenge={challenge}
                                        isCompleted={false}
                                        userId={userId}
                                        isOwner={isOwner}
                                    />
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Completed Section */}
                    {completed.length > 0 && (
                        <div className="space-y-2">
                            <div className="flex items-center gap-2 pb-2 border-b border-border/60">
                                <CheckCircle className="w-4 h-4 text-summited" />
                                <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                                    Completed ({completed.length})
                                </h2>
                            </div>
                            <div className="space-y-2">
                                {completed.map((challenge) => (
                                    <ChallengeCard
                                        key={challenge.id}
                                        challenge={challenge}
                                        isCompleted={true}
                                        userId={userId}
                                        isOwner={isOwner}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </motion.div>
            </div>
        </div>
    );
};

export default ProfileChallenges;
