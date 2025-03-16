import DailyWeather from "./DailyWeather";
import ForecastLocation from "./ForecastLocation";
import HourlyWeather from "./HourlyWeather";

export default interface WeatherResponse {
    location: ForecastLocation;
    forecast: DailyWeather[];
    hourly: HourlyWeather[];
}
