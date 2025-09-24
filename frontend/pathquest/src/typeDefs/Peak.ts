export default interface Peak {
    Id: string;
    Name: string;
    Lat: number;
    Long: number;
    Altitude?: number;
    County?: string;
    State?: string;
    Country?: string;
    distance?: number;
    isFavorited?: boolean;
    isSummitted?: boolean;
    ascents?: {
        id: string;
        timestamp: string;
        activityId: string;
        notes?: string;
    }[];
}
