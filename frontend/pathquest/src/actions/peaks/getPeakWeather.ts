"use server";

import { CurrentWeather } from "@/typeDefs/CurrentWeather";

const getPeakWeather = async (peakId: string): Promise<CurrentWeather | null> => {
    try {
        const response = await fetch(
            `${process.env.NEXT_PUBLIC_PATHQUEST_API_URL}/peaks/${peakId}/weather`,
            {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                },
                // Cache for 30 minutes - weather doesn't change that fast
                next: { revalidate: 1800 },
            }
        );

        if (!response.ok) {
            console.error(`Failed to fetch weather for peak ${peakId}: ${response.status}`);
            return null;
        }

        const data = await response.json();
        return data as CurrentWeather;
    } catch (error) {
        console.error(`Error fetching weather for peak ${peakId}:`, error);
        return null;
    }
};

export default getPeakWeather;

