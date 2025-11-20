export default interface ManualPeakSummit {
    id: string;
    user_id: string;
    peak_id: string;
    activity_id?: string;
    notes?: string;
    is_public: boolean;
    timestamp: string;
    timezone: string;
}
