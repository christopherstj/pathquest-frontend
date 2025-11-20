import Activity from "./Activity";

export interface ActivityStart {
    start_time: string;
    sport?: string;
    timezone?: string;
    gain?: number;
    peak_summits?: number;
    name?: string;
    id: string;
    user_id: string;
    start_coords?: [number, number];
    distance: number;
}
