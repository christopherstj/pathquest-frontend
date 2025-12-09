import { NextRequest, NextResponse } from "next/server";

// Weather code to description mapping (WMO codes)
const weatherDescriptions: Record<number, string> = {
    0: "Clear sky",
    1: "Mainly clear",
    2: "Partly cloudy",
    3: "Overcast",
    45: "Foggy",
    48: "Depositing rime fog",
    51: "Light drizzle",
    53: "Moderate drizzle",
    55: "Dense drizzle",
    56: "Light freezing drizzle",
    57: "Dense freezing drizzle",
    61: "Slight rain",
    63: "Moderate rain",
    65: "Heavy rain",
    66: "Light freezing rain",
    67: "Heavy freezing rain",
    71: "Slight snow",
    73: "Moderate snow",
    75: "Heavy snow",
    77: "Snow grains",
    80: "Slight rain showers",
    81: "Moderate rain showers",
    82: "Violent rain showers",
    85: "Slight snow showers",
    86: "Heavy snow showers",
    95: "Thunderstorm",
    96: "Thunderstorm with slight hail",
    99: "Thunderstorm with heavy hail",
};

// Weather code to icon mapping
const weatherIcons: Record<number, string> = {
    0: "☀️",
    1: "🌤️",
    2: "⛅",
    3: "☁️",
    45: "🌫️",
    48: "🌫️",
    51: "🌧️",
    53: "🌧️",
    55: "🌧️",
    56: "🌧️",
    57: "🌧️",
    61: "🌧️",
    63: "🌧️",
    65: "🌧️",
    66: "🌧️",
    67: "🌧️",
    71: "🌨️",
    73: "🌨️",
    75: "🌨️",
    77: "🌨️",
    80: "🌦️",
    81: "🌦️",
    82: "🌦️",
    85: "🌨️",
    86: "🌨️",
    95: "⛈️",
    96: "⛈️",
    99: "⛈️",
};

export interface WeatherData {
    temperature: number; // Fahrenheit
    temperatureFeelsLike: number; // Fahrenheit
    weatherCode: number;
    weatherDescription: string;
    weatherIcon: string;
    windSpeed: number; // mph
    windDirection: number; // degrees
    windGusts: number; // mph
    humidity: number; // percentage
    precipitation: number; // inches (probability)
    cloudCover: number; // percentage
    elevation: number; // feet (from API)
    timestamp: string;
}

interface OpenMeteoResponse {
    current: {
        time: string;
        temperature_2m: number;
        apparent_temperature: number;
        weather_code: number;
        wind_speed_10m: number;
        wind_direction_10m: number;
        wind_gusts_10m: number;
        relative_humidity_2m: number;
        precipitation: number;
        cloud_cover: number;
    };
    elevation: number;
}

// Simple in-memory cache with TTL
const cache = new Map<string, { data: WeatherData; timestamp: number }>();
const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const lat = searchParams.get("lat");
    const lng = searchParams.get("lng");

    if (!lat || !lng) {
        return NextResponse.json(
            { error: "Missing required parameters: lat and lng" },
            { status: 400 }
        );
    }

    const latitude = parseFloat(lat);
    const longitude = parseFloat(lng);

    if (isNaN(latitude) || isNaN(longitude)) {
        return NextResponse.json(
            { error: "Invalid lat or lng values" },
            { status: 400 }
        );
    }

    // Check cache
    const cacheKey = `${latitude.toFixed(3)},${longitude.toFixed(3)}`;
    const cached = cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
        return NextResponse.json(cached.data);
    }

    try {
        // Fetch from Open-Meteo API (free, no API key required)
        const openMeteoUrl = new URL("https://api.open-meteo.com/v1/forecast");
        openMeteoUrl.searchParams.set("latitude", latitude.toString());
        openMeteoUrl.searchParams.set("longitude", longitude.toString());
        openMeteoUrl.searchParams.set(
            "current",
            "temperature_2m,apparent_temperature,weather_code,wind_speed_10m,wind_direction_10m,wind_gusts_10m,relative_humidity_2m,precipitation,cloud_cover"
        );
        openMeteoUrl.searchParams.set("temperature_unit", "fahrenheit");
        openMeteoUrl.searchParams.set("wind_speed_unit", "mph");
        openMeteoUrl.searchParams.set("precipitation_unit", "inch");
        openMeteoUrl.searchParams.set("timezone", "auto");

        const response = await fetch(openMeteoUrl.toString(), {
            next: { revalidate: 600 }, // Cache for 10 minutes on the server
        });

        if (!response.ok) {
            throw new Error(`Open-Meteo API error: ${response.status}`);
        }

        const data: OpenMeteoResponse = await response.json();

        const weatherCode = data.current.weather_code;
        const weatherData: WeatherData = {
            temperature: Math.round(data.current.temperature_2m),
            temperatureFeelsLike: Math.round(data.current.apparent_temperature),
            weatherCode,
            weatherDescription:
                weatherDescriptions[weatherCode] || "Unknown",
            weatherIcon: weatherIcons[weatherCode] || "❓",
            windSpeed: Math.round(data.current.wind_speed_10m),
            windDirection: data.current.wind_direction_10m,
            windGusts: Math.round(data.current.wind_gusts_10m),
            humidity: Math.round(data.current.relative_humidity_2m),
            precipitation: data.current.precipitation,
            cloudCover: Math.round(data.current.cloud_cover),
            elevation: Math.round(data.elevation * 3.28084), // Convert meters to feet
            timestamp: data.current.time,
        };

        // Update cache
        cache.set(cacheKey, { data: weatherData, timestamp: Date.now() });

        return NextResponse.json(weatherData);
    } catch (error) {
        console.error("Weather API error:", error);
        return NextResponse.json(
            { error: "Failed to fetch weather data" },
            { status: 500 }
        );
    }
}

