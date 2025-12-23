"use client";

import React from "react";
import { MapPin, User as UserIcon } from "lucide-react";
import User from "@/typeDefs/User";

interface ExploreProfileHeaderProps {
    user: User | null;
}

export const ExploreProfileHeader = ({ user }: ExploreProfileHeaderProps) => {
    if (!user) return null;

    const location = [user.city, user.state, user.country].filter(Boolean).join(", ");

    return (
        <div className="px-4 py-3 border-b border-border/60 bg-gradient-to-b from-primary/5 to-transparent">
            <div className="flex items-center gap-3">
                {/* Avatar */}
                <div className="w-12 h-12 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center overflow-hidden flex-shrink-0">
                    {user.pic ? (
                        <img
                            src={user.pic}
                            alt={user.name || "User"}
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <UserIcon className="w-6 h-6 text-primary" />
                    )}
                </div>

                {/* Name and location */}
                <div className="flex-1 min-w-0">
                    <h1
                        className="text-lg font-bold text-foreground truncate"
                        style={{ fontFamily: "var(--font-display)" }}
                    >
                        {user.name || "Anonymous"}
                    </h1>
                    {location && (
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <MapPin className="w-3 h-3 flex-shrink-0" />
                            <span className="truncate">{location}</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};


