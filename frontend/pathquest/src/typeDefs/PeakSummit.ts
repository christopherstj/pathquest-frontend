import Peak from "./Peak";

export default interface PeakSummit extends Peak {
    ascents: {
        id: string;
        timestamp: string;
        activityId: string;
        notes?: string;
    }[];
}
