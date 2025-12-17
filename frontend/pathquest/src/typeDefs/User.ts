export default interface User {
    id: string;
    name: string;
    email?: string;
    pic: string;
    update_description: boolean;
    city?: string;
    state?: string;
    country?: string;
    location_coords?: [number, number] | null;
    units: "imperial" | "metric";
    is_subscribed: boolean;
    is_lifetime_free: boolean;
    historical_data_processed: boolean;
    processing_activity_count?: number;
    is_public?: boolean;
}
