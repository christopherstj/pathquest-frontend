import getDistanceString from "@/helpers/getDistanceString";
import getVerticalGainString from "@/helpers/getVerticalGainString";
import { ActivityStart } from "@/typeDefs/ActivityStart";
import { Theme } from "@mui/material";
import React from "react";

type Props = {
    activity: ActivityStart;
    redirect: (url: string) => void;
    theme: Theme;
    units: "metric" | "imperial";
};

const ActivityPopup = ({ activity, redirect, theme, units }: Props) => {
    const el = document.createElement("div");
    const button = document.createElement("div");
    button.style.width = "100%";
    button.style.display = "flex";
    button.innerHTML = `<button class="button-primary">Details</button>`;
    el.innerHTML = `
        ${
            activity.sport
                ? `<div style="display: flex">
            <div class="tag-primary">
                <p style="font-size: 12px">
                    ${activity.sport}
                </p>
            </div>
        </div>`
                : ""
        }
        ${
            activity.name
                ? `<p style="font-size: 16px; color: ${theme.palette.primary.onContainer}; margin-bottom: 8px">
            ${activity.name}
        </p>`
                : ""
        }
        <div style="display: flex; gap: 8px; margin-bottom: 8px; justify-content: space-between">
            <p style="color: ${theme.palette.primary.onContainerDim}">
                Distance: 
            </p>
            <p style="color: ${theme.palette.primary.onContainerDim}">
                ${getDistanceString(activity.distance, units)}
            </p>
        </div>
        ${
            activity.gain !== undefined && activity.gain !== null
                ? `
                <div style="display: flex; gap: 8px; margin-bottom: 8px; justify-content: space-between">
                    <p style="color: ${theme.palette.primary.onContainerDim}">
                        Gain: 
                    </p>
                    <p style="color: ${theme.palette.primary.onContainerDim}">
                        ${getVerticalGainString(activity.gain, units)}
                    </p>
                </div>
            `
                : ""
        }
        ${
            activity.peakSummits !== undefined
                ? `
                <div style="display: flex; gap: 8px; margin-bottom: 8px; justify-content: space-between">
                    <p style="color: ${theme.palette.primary.onContainerDim}">
                        Peak Summits: 
                    </p>
                    <p style="color: ${theme.palette.primary.onContainerDim}">
                        ${activity.peakSummits}
                    </p>
                </div>
            `
                : ""
        }
    `;
    el.appendChild(button);

    button.addEventListener(
        "click",
        (e) => {
            e.stopPropagation();
            e.preventDefault();
            redirect(`/app/activities/${activity.id}`);
        },
        true
    );

    return el;
};

export default ActivityPopup;

// ${
//     ? `<p style="color: ${
//           theme.palette.primary.onContainerDim
//       }; margin-bottom: 8px;">
//     ${Math.round(
//         units === "metric"
//             ? peak.Altitude
//             : metersToFt(peak.Altitude)
//     )}${units === "metric" ? " m" : " ft"}
// </p>
// `
//     : ""
// }
