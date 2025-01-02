export default interface ManualPeakSummit {
    id: string;
    userId: string;
    peakId: string;
    activityId?: string;
    notes?: string;
    isPublic: boolean;
    timestamp: string;
    timezone: string;
}
