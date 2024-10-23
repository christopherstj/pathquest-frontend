const getDistanceString = (meters: number, units: "metric" | "imperial") => {
    if (units === "metric") {
        if (meters < 1000) {
            return `${meters} m`;
        }
        return `${(meters / 1000).toFixed(1)} km`;
    }

    if (meters < 1609.34) {
        return `${meters} m`;
    }
    return `${(meters / 1609.34).toFixed(1)} mi`;
};

export default getDistanceString;
