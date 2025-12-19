export interface DashboardStats {
    totalPeaks: number;
    totalElevationGained: number; // in meters
    summitsThisMonth: number;
    summitsLastMonth: number;
    primaryChallengeProgress: {
        challengeId: number;
        name: string;
        completed: number;
        total: number;
    } | null;
}

export default DashboardStats;

