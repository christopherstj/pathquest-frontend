import Challenge from "./Challenge";

export default interface ChallengeProgress extends Challenge {
    total: number;
    completed: number;
    /** Date of most recent summit progress on this challenge (ISO date string) */
    lastProgressDate?: string | null;
    /** Number of peaks summited on the last progress date */
    lastProgressCount?: number;
    /** Whether the challenge is fully completed */
    is_completed?: boolean;
}
