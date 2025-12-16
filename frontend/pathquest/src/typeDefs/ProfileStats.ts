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
}

export default ProfileStats;

