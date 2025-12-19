export interface ClimbingStreak {
    currentStreak: number; // Number of consecutive months with at least 1 summit
    isActive: boolean; // True if current month has a summit (streak is ongoing)
    lastSummitMonth: string | null; // ISO date string of the last month with a summit
}

export interface ProfileStats {
    totalPeaks: number;
    totalSummits: number;
    highestPeak: {
        id: string;
        name: string;
        elevation: number;
    } | null;
    challengesCompleted: number;
    totalElevationGained: number;
    statesClimbed: string[];
    countriesClimbed: string[];
    thisYearSummits: number;
    lastYearSummits: number;
    peakTypeBreakdown: {
        fourteeners: number;
        thirteeners: number;
        twelvers: number;
        elevenThousanders: number;
        tenThousanders: number;
        other: number;
    };
    climbingStreak: ClimbingStreak;
}

export default ProfileStats;

