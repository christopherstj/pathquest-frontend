"use client";

import React, { useState } from "react";
import { AlertTriangle, ChevronDown, ChevronUp } from "lucide-react";
import type { NwsAlerts, NwsAlert, AlertSeverity } from "@pathquest/shared/types";
import { cn } from "@/lib/utils";

interface AlertsBannerProps {
    alerts: NwsAlerts;
    className?: string;
}

const severityStyles: Record<AlertSeverity, string> = {
    Extreme: "bg-red-900/50 border border-red-500/50 text-red-200",
    Severe: "bg-orange-900/50 border border-orange-500/50 text-orange-200",
    Moderate: "bg-yellow-900/50 border border-yellow-500/50 text-yellow-200",
    Minor: "bg-blue-900/50 border border-blue-500/50 text-blue-200",
    Unknown: "bg-gray-900/50 border border-gray-500/50 text-gray-200",
};

const AlertCard = ({ alert }: { alert: NwsAlert }) => {
    const [expanded, setExpanded] = useState(false);

    return (
        <div
            className={cn(
                "rounded-lg p-3 cursor-pointer",
                severityStyles[alert.severity]
            )}
            onClick={() => setExpanded(!expanded)}
        >
            <div className="flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
                <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                        <span className="text-sm font-semibold">{alert.event}</span>
                        {expanded ? (
                            <ChevronUp className="w-3.5 h-3.5 shrink-0 opacity-60" />
                        ) : (
                            <ChevronDown className="w-3.5 h-3.5 shrink-0 opacity-60" />
                        )}
                    </div>
                    <p className="text-xs opacity-80 mt-0.5 line-clamp-2">{alert.headline}</p>
                    {expanded && (
                        <div className="mt-2 space-y-2 text-xs opacity-70">
                            <p className="whitespace-pre-wrap">{alert.description}</p>
                            {alert.instruction && (
                                <p className="font-medium opacity-90">{alert.instruction}</p>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const AlertsBanner = ({ alerts, className }: AlertsBannerProps) => {
    if (!alerts.alerts || alerts.alerts.length === 0) return null;

    return (
        <div className={cn("space-y-2", className)}>
            {alerts.activeCount > 1 && (
                <div className="flex items-center gap-1.5">
                    <span className="text-[10px] text-muted-foreground uppercase tracking-wider">
                        Active Alerts
                    </span>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-full bg-red-500/20 text-red-400">
                        {alerts.activeCount}
                    </span>
                </div>
            )}
            {alerts.alerts.map((alert) => (
                <AlertCard key={alert.id} alert={alert} />
            ))}
        </div>
    );
};

export default AlertsBanner;
