export default interface Challenge {
    id: string;
    name: string;
    region?: string;
    centerLat?: number;
    centerLong?: number;
    numPeaks: number;
    isFavorited: boolean;
    isPublic: boolean | null;
}
