import metersToFt from "@/helpers/metersToFt";
import UnclimbedPeak from "@/typeDefs/UnclimbedPeak";
import { Theme, useTheme } from "@mui/material";
import React from "react";

type Props = {
    peak: UnclimbedPeak;
    units: "metric" | "imperial";
    theme: Theme;
    onFavoriteClick: (peakId: string, newValue: boolean) => void;
};

const UnclimbedPopup = ({ peak, units, theme, onFavoriteClick }: Props) => {
    const el = document.createElement("div");
    const button = document.createElement("div");
    button.style.width = "100%";
    button.style.display = "flex";
    button.innerHTML = `<button class="button-secondary">Favorite</button>`;
    el.innerHTML = `
        <div style="display: flex">
            <div class="tag-secondary">
                <p style="font-size: 12px">
                    Unclimbed
                </p>
            </div>
        </div>
        <p style="font-size: 16px; color: ${
            theme.palette.secondary.onContainer
        }; margin-bottom: 8px">
            ${peak.Name}
        </p>
        ${
            peak.Altitude
                ? `<p style="color: ${
                      theme.palette.secondary.onContainerDim
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
        <a href="/app/peaks/${peak.Id}" class="link-secondary">
            View Peak
        </a>
    `;
    el.appendChild(button);

    const favoriteClick = () => {
        onFavoriteClick(peak.Id, true);
        // button.innerHTML = `<button class="button-secondary">Unfavorite</button>`;
        // button.removeEventListener("click", favoriteClick, true);
        // button.addEventListener("click", unFavoriteClick, true);
    };

    // const unFavoriteClick = () => {
    //     onFavoriteClick(peak.Id, false);
    //     button.innerHTML = `<button class="button-secondary">Favorite</button>`;
    //     button.removeEventListener("click", unFavoriteClick, true);
    //     button.addEventListener("click", favoriteClick, true);
    // };

    button.addEventListener("click", favoriteClick, true);

    return el;
};

export default UnclimbedPopup;
