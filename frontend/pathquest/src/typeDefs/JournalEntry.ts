export interface JournalEntry {
    id: string;
    timestamp: string;
    notes?: string;
    difficulty?: "easy" | "moderate" | "hard" | "expert";
    experienceRating?: "amazing" | "good" | "tough" | "epic";
    conditionTags?: string[];
    customConditionTags?: string[];
    isPublic?: boolean;
    timezone?: string;
    hasReport: boolean;
    summitNumber: number;
    // Weather data
    temperature?: number;
    weatherCode?: number;
    cloudCover?: number;
    windSpeed?: number;
    // Peak data (inline)
    peak: {
        id: string;
        name: string;
        elevation?: number;
        state?: string;
        country?: string;
    };
    // Activity data (inline, optional - null for manual summits)
    activity?: {
        id: string;
        title: string;
        sport?: string;
        distance?: number;
        gain?: number;
    };
}

export interface JournalResult {
    entries: JournalEntry[];
    nextCursor: string | null;
    totalCount: number;
}

export interface JournalFilters {
    cursor?: string;
    limit?: number;
    search?: string;
    year?: number;
    hasReport?: boolean;
    peakId?: string;
}

export default JournalEntry;

