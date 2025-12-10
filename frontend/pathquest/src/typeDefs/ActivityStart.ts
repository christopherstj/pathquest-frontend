export interface ActivityStart {
    start_time: string;
    sport?: string;
    timezone?: string;
    gain?: number;
    peak_summits?: number;
    title?: string;
    id: string;
    user_id: string;
    start_coords?: [number, number];
    distance: number;
}
