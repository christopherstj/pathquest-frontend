export default interface Activity {
    id: string;
    userId: string;
    startLat: number;
    startLong: number;
    distance: number;
    coords: string;
    startTime: number;
}
