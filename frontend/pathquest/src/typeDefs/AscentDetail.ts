import { ConditionTag, Difficulty, ExperienceRating } from "./Summit";

export default interface AscentDetail {
    id: string;
    timestamp: string;
    activity_id?: string;
    peak_id: string;
    notes?: string;
    is_public: boolean;
    timezone?: string;
    difficulty?: Difficulty;
    experience_rating?: ExperienceRating;
    condition_tags?: ConditionTag[];
}
