export interface CurrentWeather {
    temperature: number | null; // Celsius
    weatherCode: number | null;
    cloudCover: number | null;
    windSpeed: number | null; // km/h
    windDirection: number | null; // degrees
    humidity: number | null; // percent
    precipitation: number | null; // mm
    feelsLike: number | null; // Celsius
    isDay: boolean | null;
}

