import metersToFt from "@/helpers/metersToFt";
import UnclimbedPeak from "@/typeDefs/UnclimbedPeak";
import { Theme, useTheme } from "@mui/material";
import React from "react";

type Props = {
    peak: UnclimbedPeak;
    units: "metric" | "imperial";
    theme: Theme;
    onFavoriteClick?: (peakId: string, newValue: boolean) => void;
    color?: "primary" | "secondary" | "tertiary";
};

const UnclimbedPopup = ({
    peak,
    units,
    theme,
    onFavoriteClick,
    color = "secondary",
}: Props) => {
    const el = document.createElement("div");
    const button = document.createElement("div");
    button.style.width = "100%";
    button.style.display = "flex";
    button.innerHTML = `<button class="button-${color}">Favorite</button>`;
    el.innerHTML = `
        <div style="display: flex">
            <div class="tag-${color}">
                <p style="font-size: 12px">
                    ${peak.isSummitted ? "Completed" : "Unclimbed"}
                </p>
            </div>
        </div>
        <p style="font-size: 16px; color: ${
            theme.palette[color].onContainer
        }; margin-bottom: 8px">
            ${peak.Name}
        </p>
        ${
            peak.Altitude
                ? `<p style="color: ${
                      theme.palette[color].onContainerDim
                  }; margin-bottom: 8px;">
                ${Math.round(
                    units === "metric"
                        ? peak.Altitude
                        : metersToFt(peak.Altitude)
                )}${units === "metric" ? " m" : " ft"}
            </p>    
        `
                : ""
        }
        <a href="/app/peaks/${peak.Id}" class="link-${color}">
            View Peak
        </a>
    `;
    if (!peak.isSummitted && onFavoriteClick) el.appendChild(button);

    const favoriteClick = () => {
        if (onFavoriteClick) onFavoriteClick(peak.Id, true);
    };

    button.addEventListener("click", favoriteClick, true);

    return el;
};

export default UnclimbedPopup;
