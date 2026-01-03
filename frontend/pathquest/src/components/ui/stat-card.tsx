import React from "react";

interface StatCardProps {
    label: string;
    value: React.ReactNode;
    className?: string;
}

const StatCard = ({ label, value, className = "" }: StatCardProps) => {
    return (
        <div className={`p-4 rounded-xl bg-card border border-border/70 shadow-sm ${className}`}>
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                {label}
            </p>
            <p className="text-xl font-mono text-foreground">{value}</p>
        </div>
    );
};

export default StatCard;





