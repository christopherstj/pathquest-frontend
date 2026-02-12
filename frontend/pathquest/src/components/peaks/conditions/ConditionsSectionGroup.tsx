"use client";

import React, { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface ConditionsSectionGroupProps {
    title: string;
    icon: React.ReactNode;
    defaultOpen?: boolean;
    badge?: React.ReactNode;
    className?: string;
    children: React.ReactNode;
}

const ConditionsSectionGroup = ({
    title,
    icon,
    defaultOpen = true,
    badge,
    className,
    children,
}: ConditionsSectionGroupProps) => {
    const [isOpen, setIsOpen] = useState(defaultOpen);

    return (
        <div className={cn("border-t border-border/40 pt-3", className)}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center gap-2 py-1 group cursor-pointer"
            >
                <span className="text-primary/70">{icon}</span>
                <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                    {title}
                </span>
                {badge && <span className="ml-1">{badge}</span>}
                <ChevronDown
                    className={cn(
                        "w-3.5 h-3.5 text-muted-foreground/50 ml-auto transition-transform duration-200",
                        !isOpen && "-rotate-90"
                    )}
                />
            </button>
            <div
                className={cn(
                    "grid transition-[grid-template-rows] duration-200 ease-out",
                    isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                )}
            >
                <div className="overflow-hidden">
                    <div className="pt-2 space-y-3">{children}</div>
                </div>
            </div>
        </div>
    );
};

export default ConditionsSectionGroup;
