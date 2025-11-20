export default interface AscentDetail {
    id: string;
    timestamp: string;
    activity_id?: string;
    peak_id: string;
    notes?: string;
    is_public: boolean;
    timezone?: string;
}
