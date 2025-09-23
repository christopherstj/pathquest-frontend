export interface User {
    id: string;
    name: string;
    pic: string;
    updateDescription: boolean;
    email?: string;
    city?: string;
    state?: string;
    country?: string;
    lat?: number;
    long?: number;
    units: "imperial" | "metric";
    isSubscribed: boolean;
    isLifetimeFree: boolean;
    historicalDataProcessed: boolean;
    processingActivityCount?: number;
}
