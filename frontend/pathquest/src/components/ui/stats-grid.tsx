import React from "react";

interface StatsGridProps {
    children: React.ReactNode;
    columns?: 2 | 3;
    className?: string;
}

const StatsGrid = ({ children, columns = 2, className = "" }: StatsGridProps) => {
    return (
        <div className={`grid grid-cols-${columns} gap-3 ${className}`}>
            {children}
        </div>
    );
};

export default StatsGrid;









