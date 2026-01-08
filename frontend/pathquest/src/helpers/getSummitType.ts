import type { SummitType } from "@pathquest/shared/types";

/**
 * Determine the summit type based on whether the summit has an activity_id.
 * - If activity_id exists and is not empty → "activity" (from Strava)
 * - Otherwise → "manual" (manually entered)
 */
export function getSummitType(activityId?: string | null): SummitType {
    return activityId && activityId.trim() !== "" ? "activity" : "manual";
}

export default getSummitType;

