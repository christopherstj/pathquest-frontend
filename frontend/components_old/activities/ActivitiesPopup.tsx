import { ActivityStart } from "@/typeDefs/ActivityStart";
import { Theme } from "@mui/material";
import { GeoJSONFeature } from "mapbox-gl";
import React from "react";

type Props = {
    activities: ActivityStart[];
    theme: Theme;
};

const ActivitiesPopup = (props: Props) => {
    const el = document.createElement("div");

    el.innerHTML = `
        <h6>Activities</h6>
        <ul>
            ${props.activities
                .map((feature) => {
                    return `<li>${feature.name}</li>`;
                })
                .join("")}
        </ul>
    `;

    return el;
};

export default ActivitiesPopup;
