export default interface Summit {
    id: string;
    timestamp: string;
    activity_id: string;
    notes?: string;
    temperature?: number;
    precipitation?: number;
    weather_code?: number;
    cloud_cover?: number;
    humidity?: number;
    wind_speed?: number;
    wind_direction?: number;
    is_public?: boolean;
}
