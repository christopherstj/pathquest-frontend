export default interface Challenge {
    id: number;
    name: string;
    region?: string;
    centerLat?: number;
    centerLong?: number;
    numPeaks: number;
}
