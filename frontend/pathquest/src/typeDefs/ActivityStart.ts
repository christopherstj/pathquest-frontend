import Activity from "./Activity";

export interface ActivityStart {
    startTime: number;
    sport?: string;
    timezone?: string;
    gain?: number;
    peakSummits?: number;
    name?: string;
    id: string;
    userId: string;
    startLat: number;
    startLong: number;
    distance: number;
}
