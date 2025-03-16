"use server";
import getBackendUrl from "@/helpers/getBackendUrl";
import WeatherResponse from "@/typeDefs/WeatherResponse";

const backendUrl = getBackendUrl();

const getWeatherByPeak = async (
    peakId: string
): Promise<WeatherResponse | null> => {
    const weatherUrl = `${backendUrl}/peaks/${peakId}/weather`;

    const weatherRes = await fetch(weatherUrl, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        },
    });

    if (!weatherRes.ok) {
        console.error(await weatherRes.text());
        return null;
    }

    const weather = await weatherRes.json();

    return weather;
};

export default getWeatherByPeak;
