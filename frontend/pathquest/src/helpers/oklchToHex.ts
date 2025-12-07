import { oklch, formatHex } from "culori";

const oklchToHex = (oklchString: string) => {
    const color = oklch(oklchString);
    if (!color) return "#000000";
    return formatHex(color);
};

export default oklchToHex;
