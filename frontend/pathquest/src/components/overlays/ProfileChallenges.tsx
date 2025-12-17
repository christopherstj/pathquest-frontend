"use client";

import React from "react";
import { motion } from "framer-motion";
import { Trophy, ChevronRight } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import getUserProfile from "@/actions/users/getUserProfile";
import Link from "next/link";

interface ProfileChallengesProps {
    userId: string;
}

const ProfileChallenges = ({ userId }: ProfileChallengesProps) => {
    const { data, isLoading } = useQuery({
        queryKey: ["userProfile", userId],
        queryFn: async () => {
            const res = await getUserProfile(userId);
            return res;
        },
    });

    const profile = data?.success ? data.data : null;
    const acceptedChallenges = profile?.acceptedChallenges ?? [];

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-10">
                <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (acceptedChallenges.length === 0) {
        return (
            <div className="text-center py-10 text-muted-foreground">
                <Trophy className="w-10 h-10 mx-auto mb-3 opacity-50" />
                <p className="text-sm font-medium">No accepted challenges</p>
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
                    className="space-y-3"
                >
                    <div className="flex items-center gap-2 pb-3 border-b border-border/60">
                        <Trophy className="w-4 h-4 text-secondary" />
                        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                            Accepted Challenges ({acceptedChallenges.length})
                        </h2>
                    </div>
                    <div className="space-y-2">
                        {acceptedChallenges.map((challenge) => {
                            const progress = challenge.total > 0
                                ? Math.round((challenge.completed / challenge.total) * 100)
                                : 0;
                            return (
                                <Link
                                    key={challenge.id}
                                    href={`/challenges/${challenge.id}`}
                                    className="block p-3 rounded-lg bg-card border border-border/70 hover:border-primary/50 hover:bg-card/80 transition-colors group"
                                >
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-2">
                                            <Trophy className="w-4 h-4 text-secondary" />
                                            <span className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                                                {challenge.name}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs text-muted-foreground">
                                                {challenge.completed}/{challenge.total}
                                            </span>
                                            <ChevronRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                                        </div>
                                    </div>
                                    <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-gradient-to-r from-secondary to-primary rounded-full transition-all"
                                            style={{ width: `${progress}%` }}
                                        />
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default ProfileChallenges;

