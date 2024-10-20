import metersToFt from "@/helpers/metersToFt";
import FavoritedPeak from "@/typeDefs/FavoritedPeak";
import { Theme, useTheme } from "@mui/material";
import React from "react";

type Props = {
    peak: FavoritedPeak;
    units: "metric" | "imperial";
    theme: Theme;
    onUnfavoriteClick: (peakId: string, newValue: boolean) => void;
};

const FavoritePopup = ({ peak, units, theme, onUnfavoriteClick }: Props) => {
    const el = document.createElement("div");
    const button = document.createElement("div");
    button.style.width = "100%";
    button.style.display = "flex";
    button.innerHTML = `<button class="button-tertiary">Unfavorite</button>`;
    el.innerHTML = `
        <div style="display: flex">
            <div class="tag-tertiary">
                <p style="font-size: 12px">
                    Favorite
                </p>
            </div>
        </div>
        <p style="font-size: 16px; color: ${
            theme.palette.tertiary.onContainer
        }; margin-bottom: 8px">
            ${peak.Name}
        </p>
        ${
            peak.Altitude
                ? `<p style="color: ${
                      theme.palette.tertiary.onContainerDim
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
        <a href="/app/peaks/${peak.Id}" class="link-tertiary">
            View Peak
        </a>
    `;

    el.appendChild(button);

    const favoriteClick = () => {
        onUnfavoriteClick(peak.Id, false);
        // button.removeEventListener("click", favoriteClick, true);
        // button.addEventListener("click", unFavoriteClick, true);
    };

    button.addEventListener("click", favoriteClick, true);

    return el;
};

export default FavoritePopup;
