export default interface ForecastLocation {
    "location-key": string;
    point: {
        latitude: string;
        longitude: string;
    };
    "area-description": string;
    height: {
        "#text": number;
        datum: string;
        "height-units": string;
    };
}
