import { Difficulty, ExperienceRating } from "./Summit";

export default interface ManualPeakSummit {
    id: string;
    user_id: string;
    peak_id: string;
    activity_id?: string;
    notes?: string;
    is_public: boolean;
    timestamp: string;
    timezone: string;
    difficulty?: Difficulty;
    experience_rating?: ExperienceRating;
    /** Whether the summit has a trip report (notes, difficulty, or experience rating) */
    hasReport?: boolean;
    /** The summit number for this user (1st summit, 2nd summit, etc.) */
    summitNumber?: number;
}
