export default interface Challenge {
    id: string;
    name: string;
    region?: string;
    location_coords?: [number, number];
    num_peaks: number;
    is_favorited: boolean;
    is_public: boolean | null;
}
