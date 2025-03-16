export default interface HourlyWeather {
    time: string;
    temp: number | null;
    dewPoint: number | null;
    windChill: number | null;
    precipProb: number | null;
    windSpeed: number | null;
    windGust: number | null;
    windDirection: number | null;
    cloudCover: number | null;
    humidity: number | null;
    weather: {
        value: {
            "weather-type": string;
            coverage: string;
        };
    } | null;
}
