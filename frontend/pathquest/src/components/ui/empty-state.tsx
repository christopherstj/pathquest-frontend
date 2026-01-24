import React from "react";
import { LucideIcon } from "lucide-react";

interface EmptyStateProps {
    icon: LucideIcon;
    title: string;
    description?: string;
    className?: string;
}

const EmptyState = ({ icon: Icon, title, description, className = "" }: EmptyStateProps) => {
    return (
        <div className={`p-6 rounded-lg bg-card/50 border border-border/50 text-center ${className}`}>
            <Icon className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">{title}</p>
            {description && (
                <p className="text-xs text-muted-foreground mt-1">{description}</p>
            )}
        </div>
    );
};

export default EmptyState;









