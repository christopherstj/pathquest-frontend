import { SvgIcon, SvgIconProps } from "@mui/material";
import React from "react";

const PeakSummit = (props: SvgIconProps) => {
    return (
        <SvgIcon
            width="125"
            height="150"
            viewBox="0 0 125 150"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            {...props}
        >
            <path
                d="M125 62.5539C125 97.1014 97.0178 125.108 62.5 125.108C27.9822 125.108 0 97.1014 0 62.5539C0 28.0063 27.9822 0 62.5 0C97.0178 0 125 28.0063 125 62.5539Z"
                fill="url(#paint0_linear_401_165)"
            />
            <path
                d="M60.6822 60.8381C61.701 59.8185 63.3527 59.8185 64.3715 60.8381L106.687 103.19C107.706 104.21 107.706 105.863 106.687 106.883L64.3715 149.235C63.3527 150.255 61.701 150.255 60.6822 149.235L18.3663 106.883C17.3476 105.863 17.3476 104.21 18.3663 103.19L60.6822 60.8381Z"
                fill="url(#paint1_linear_401_165)"
            />
            <path
                d="M10 77.5658C10 77.5658 34.3401 37 37.2551 37C40.17 37 51.5384 58.9805 55.1822 60.634C56.4939 61.2292 60.2834 61.2169 61.7409 60.634C64.6558 59.4682 67.7166 51.6244 68.7368 50.9335C69.7571 50.2425 81.5255 52.3444 84.1862 50.9335C88.2519 48.7774 90.5992 41.9384 92.7854 41.9384C94.9716 41.9384 115.075 77.5658 115.075 77.5658H10Z"
                fill="white"
            />
            <defs>
                <linearGradient
                    id="paint0_linear_401_165"
                    x1="62.5"
                    y1="0"
                    x2="62.5"
                    y2="150"
                    gradientUnits="userSpaceOnUse"
                >
                    <stop stopColor="#00201A" />
                    <stop offset="1" stopColor="#4C7267" />
                </linearGradient>
                <linearGradient
                    id="paint1_linear_401_165"
                    x1="62.5"
                    y1="0"
                    x2="62.5"
                    y2="150"
                    gradientUnits="userSpaceOnUse"
                >
                    <stop stopColor="#00201A" />
                    <stop offset="1" stopColor="#4C7267" />
                </linearGradient>
            </defs>
        </SvgIcon>
    );
};

export default PeakSummit;
