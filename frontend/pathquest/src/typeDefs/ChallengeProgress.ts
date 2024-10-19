import Challenge from "./Challenge";

export default interface ChallengeProgress extends Challenge {
    total: number;
    completed: number;
}
