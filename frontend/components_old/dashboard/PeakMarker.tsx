import React from "react";
import peakMarker from "../../public/images/marker-primary.png";

const PeakMarker = () => {
    const el = document.createElement("div");
    el.className = "marker";
    el.style.backgroundImage = `url(${peakMarker.src})`;
    el.style.width = "32px";
    el.style.height = "32px";
    el.style.backgroundSize = "contain";
    el.style.backgroundRepeat = "no-repeat";

    return el;
};

export default PeakMarker;
