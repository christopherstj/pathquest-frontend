import Peak from "./Peak";

export default interface PeakSummit extends Peak {
    ascents: {
        timestamp: string;
        activityId: string;
    }[];
}
