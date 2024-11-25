const getVerticalGainString = (
    gainMeters: number,
    units: "metric" | "imperial"
) => {
    if (units === "metric") {
        return `${gainMeters.toFixed(0)} m`;
    } else {
        const gainFeet = gainMeters * 3.28084;
        return `${gainFeet.toFixed(0)} ft`;
    }
};

export default getVerticalGainString;
