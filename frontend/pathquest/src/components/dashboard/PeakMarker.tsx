import React from "react";
import Image from "next/image";
import peakMarker from "../../public/images/peak-marker.svg";

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
