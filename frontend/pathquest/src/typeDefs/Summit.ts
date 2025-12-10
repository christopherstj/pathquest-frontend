export type Difficulty = "easy" | "moderate" | "hard" | "expert";
export type ExperienceRating = "amazing" | "good" | "tough" | "epic";

export default interface Summit {
    id: string;
    timestamp: string;
    timezone?: string;
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
    difficulty?: Difficulty;
    experience_rating?: ExperienceRating;
}
