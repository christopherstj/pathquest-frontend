import { SvgIcon, SvgIconProps } from "@mui/material";
import React from "react";

const StravaIcon = (props: SvgIconProps) => {
    return (
        <SvgIcon
            width="800px"
            height="800px"
            viewBox="0 0 24 24"
            role="img"
            xmlns="http://www.w3.org/2000/svg"
            {...props}
        >
            <title>Strava icon</title>
            <path d="M15.387 17.944l-2.089-4.116h-3.065L15.387 24l5.15-10.172h-3.066m-7.008-5.599l2.836 5.598h4.172L10.463 0l-7 13.828h4.169" />
        </SvgIcon>
    );
};

export default StravaIcon;
