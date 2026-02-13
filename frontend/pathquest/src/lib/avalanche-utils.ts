import type { AvalancheDangerLevel } from "@pathquest/shared/types";

export const dangerConfig: Record<AvalancheDangerLevel, { label: string; color: string; bg: string; barColor: string }> = {
    0: { label: "No Rating", color: "text-gray-400", bg: "bg-gray-500/20", barColor: "bg-gray-500" },
    1: { label: "Low", color: "text-emerald-400", bg: "bg-emerald-500/15", barColor: "bg-emerald-500" },
    2: { label: "Moderate", color: "text-yellow-400", bg: "bg-yellow-500/15", barColor: "bg-yellow-500" },
    3: { label: "Considerable", color: "text-orange-400", bg: "bg-orange-500/15", barColor: "bg-orange-500" },
    4: { label: "High", color: "text-red-400", bg: "bg-red-500/15", barColor: "bg-red-500" },
    5: { label: "Extreme", color: "text-red-200", bg: "bg-red-900/40", barColor: "bg-red-600" },
};

/** Strip HTML tags from text */
export const stripHtml = (html: string): string => {
    return html
        .replace(/<br\s*\/?>/gi, "\n")
        .replace(/<\/p>/gi, "\n")
        .replace(/<[^>]+>/g, "")
        .replace(/&amp;/g, "&")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/&nbsp;/g, " ")
        .replace(/\n{3,}/g, "\n\n")
        .trim();
};
