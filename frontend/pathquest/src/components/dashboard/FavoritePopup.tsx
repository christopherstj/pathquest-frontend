import metersToFt from "@/helpers/metersToFt";
import FavoritedPeak from "@/typeDefs/FavoritedPeak";
import { Theme, useTheme } from "@mui/material";
import React from "react";

type Props = {
    peak: FavoritedPeak;
    units: "metric" | "imperial";
    theme: Theme;
};

const FavoritePopup = ({ peak, units, theme }: Props) => {
    return `
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
};

export default FavoritePopup;
