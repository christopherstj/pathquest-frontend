export interface UnconfirmedSummit {
    id: string;
    peakId: string;
    peakName: string;
    peakElevation: number;
    activityId: string;
    timestamp: string;
    distanceFromPeak: number; // meters
    confidenceScore: number;
}

export default UnconfirmedSummit;

