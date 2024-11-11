"use client";
import metersToFt from "@/helpers/metersToFt";
import PeakSummit from "@/typeDefs/PeakSummit";
import UnclimbedPeak from "@/typeDefs/UnclimbedPeak";
import { Theme, useTheme } from "@mui/material";
import React from "react";

type Props = {
    peak: PeakSummit | UnclimbedPeak;
    units: "metric" | "imperial";
    theme: Theme;
    showButtton?: boolean;
};

const CompletedPopup = ({ peak, units, theme, showButtton = true }: Props) => {
    const ascents =
        "ascents" in peak
            ? typeof peak.ascents === "string"
                ? JSON.parse(peak.ascents)
                : peak.ascents
            : [];
    return `
        <div style="display: flex">
            <div class="tag-primary">
                <p style="font-size: 12px">
                    Completed
                </p>
            </div>
        </div>
        <p style="font-size: 16px; color: ${
            theme.palette.primary.onContainer
        }; margin-bottom: 8px">
            ${peak.Name}
        </p>
        ${
            peak.Altitude
                ? `<p style="color: ${theme.palette.primary.onContainerDim}">
                ${Math.round(
                    units === "metric"
                        ? peak.Altitude
                        : metersToFt(peak.Altitude)
                )}${units === "metric" ? " m" : " ft"}
            </p>    
        `
                : ""
        }
        ${
            ascents.length > 0
                ? `<p style="color: ${
                      theme.palette.primary.onContainerDim
                  }; margin-bottom: 8px;">
            ${ascents.length} summit${ascents.length > 1 ? "s" : ""}
        </p>`
                : ""
        }
        ${
            showButtton
                ? `<a href="/app/peaks/${peak.Id}" class="link-primary">
            View Peak
        </a>`
                : ""
        }
    `;
};

export default CompletedPopup;
