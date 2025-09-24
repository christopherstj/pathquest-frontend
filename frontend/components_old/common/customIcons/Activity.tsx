import { SvgIcon, SvgIconProps } from "@mui/material";
import React from "react";

const Activity = (props: SvgIconProps) => {
    return (
        <SvgIcon
            width="65"
            height="48"
            viewBox="0 0 65 48"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            {...props}
        >
            <path
                d="M2 22.3632C2 22.3632 7.25342 22.3632 10.6196 22.3632C12.6087 22.3632 14.5978 33.5162 16.587 33.5162C18.5761 33.5162 24.5435 3.28942 27.1957 2.02542C29.8478 0.761412 34.4891 47.0621 36.4783 45.9814C39.1304 44.5404 41.7826 11.8663 44.4348 11.8663C47.087 11.8663 48.413 32.2041 50.4022 32.2041C52.3913 32.2041 54.3804 23.6754 56.3696 23.6754C58.3587 23.6754 63 23.6754 63 23.6754"
                stroke="#85D6C1"
                strokeWidth="4"
                strokeLinecap="round"
            />
        </SvgIcon>
    );
};

export default Activity;
