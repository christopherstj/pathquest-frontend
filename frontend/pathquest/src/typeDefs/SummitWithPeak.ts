import { Difficulty, ExperienceRating, ConditionTag } from "./Summit";

export default interface SummitWithPeak {
    id: string;
    timestamp: string;
    timezone?: string;
    activity_id?: string;
    notes?: string;
    is_public?: boolean;
    difficulty?: Difficulty;
    experience_rating?: ExperienceRating;
    condition_tags?: ConditionTag[];
    temperature?: number;
    weather_code?: number;
    precipitation?: number;
    cloud_cover?: number;
    wind_speed?: number;
    wind_direction?: number;
    humidity?: number;
    peak: {
        id: string;
        name: string;
        elevation?: number;
        location_coords?: [number, number];
        county?: string;
        state?: string;
        country?: string;
    };
}

