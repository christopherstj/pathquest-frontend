import metersToFt from "./metersToFt";

const getElevationString = (elevation: number, units: "metric" | "imperial") =>
    `${Math.round(units === "metric" ? elevation : metersToFt(elevation))
        .toString()
        .replace(/\B(?=(\d{3})+(?!\d))/g, ",")} ${
        units === "metric" ? "m" : "ft"
    }`;

export default getElevationString;
